import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailService 
{
  private sesClient: SESClient;
  private readonly logger = new Logger('MailService');

  constructor(private readonly configService: ConfigService) 
  {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_SES!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SES!,
      },
    });
  }

  /**
   * Genera el HTML brutalista/retro para los correos
   */

  private getMovietequeTemplate(title: string, messageHtml: string): string 
  {
    return `
      <div style="background-color: #0B2833; padding: 40px 20px; font-family: 'Courier New', Courier, monospace, sans-serif; color: #CBD3D6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0B2833; border: 2px solid #CBD3D6; padding: 30px; box-shadow: 8px 8px 0px #988775;">
          
          <h1 style="color: #CBD3D6; margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: -1px; border-bottom: 2px dashed #617B85; padding-bottom: 10px;">
            [ ${title} ]
          </h1>
          
          <div style="font-size: 16px; line-height: 1.6; color: #CBD3D6; margin-top: 20px; margin-bottom: 30px;">
            ${messageHtml}
          </div>
          
          <div style="border-top: 2px solid #617B85; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #617B85;">
            > SISTEMA AUTOMATIZADO MOVIETEQUE<br/>
            > POR FAVOR NO RESPONDER A ESTE MENSAJE
          </div>

        </div>
      </div>
    `;
  }
  /**
   * Envía un correo electrónico con formato HTML usando AWS SES.
   * @param to Correo del destinatario.
   * @param subject Asunto del correo (lo que se ve en la bandeja de entrada).
   * @param templateTitle Título visual dentro del correo.
   * @param bodyHtml Contenido del mensaje en formato HTML.
   */
  async sendHtmlEmail(to: string, subject: string, templateTitle: string, bodyHtml: string): Promise<boolean> 
  {
    const senderEmail = 'soporte@movieteque.com'; 
    
    // Generamos el diseño inyectando el contenido
    const finalHtml = this.getMovietequeTemplate(templateTitle, bodyHtml);

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: finalHtml,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: senderEmail,
    });

    try 
    {
      await this.sesClient.send(command);
      this.logger.log(`Correo HTML enviado exitosamente a ${to}`);
      return true;
    }
    catch (error) 
    {
      const err = error as Error;
      this.logger.error(`Error enviando correo a ${to}: ${err.message}`);
      throw new InternalServerErrorException('Error enviando correo electrónico.');
    }
  }
}
