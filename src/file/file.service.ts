import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid'; // Para generar nombres únicos
import sharp from 'sharp';

@Injectable()
export class FileService 
{
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor() 
  {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> 
  {
    try 
    {
      // Tomamos el buffer (la imagen cruda en RAM) y le decimos a sharp que 
      // la redimensione a 300x300, la convierta a WebP (muy liviano) y la optimice.
      const optimizedImageBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      const fileName = `profiles/${uuidv4()}.webp`; 

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName, // La ruta y nombre dentro del bucket
        Body: optimizedImageBuffer, // El archivo ya optimizado
        ContentType: 'image/webp', // Le decimos al navegador qué tipo de archivo es
      });

      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;

    }
    catch (error) 
    {
      console.error('Error al subir a S3:', error);
      throw new InternalServerErrorException('Error al subir la imagen al servidor');
    }
  }
  async deleteProfileImage(file: string)
  {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: file,
    })
    await this.s3Client.send(command)
  }
}
