import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactsService {
  // Aquí ocurre la Inyección de Dependencias
  constructor(private readonly prisma: PrismaService) {}

  // Prisma: crea un registro en la tabla Contact
  async create(createContactDto: CreateContactDto) {
    try {
      return await this.prisma.contact.create({
        data: createContactDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
      throw error;
    }
  }

  async findAll() {
    // Prisma: devuelve todos los registros, ordenados por fecha
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });
    if (!contact) {
      throw new NotFoundException(`Contact #${id} not found`);
    }
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: updateContactDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Prisma: elimina por ID
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
