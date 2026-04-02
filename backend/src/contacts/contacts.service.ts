import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactsService {
  // Aquí ocurre la Inyección de Dependencias
  constructor(private readonly prisma: PrismaService) {}

  // Prisma: crea un registro en la tabla Contact
  async create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({
      data: createContactDto, // Contiene 'name' y 'email' ya validados
    });
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
    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: number) {
    // Prisma: elimina por ID
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
