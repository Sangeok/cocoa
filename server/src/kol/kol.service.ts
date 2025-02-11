import { Injectable, NotFoundException } from '@nestjs/common';
import { KolRepository } from './kol.repository';
import { type KOL } from '../database/schema/kol';
import { CreateKolDto, UpdateKolDto } from './dto/kol.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KolService {
  constructor(private readonly kolRepository: KolRepository) {}

  async findAll(): Promise<KOL[]> {
    return this.kolRepository.findAll();
  }

  async findOne(id: string): Promise<KOL> {
    const kol = await this.kolRepository.findOne(id);
    if (!kol) {
      throw new NotFoundException(`KOL with ID ${id} not found`);
    }
    return kol;
  }

  async create(createKolDto: CreateKolDto): Promise<KOL> {
    const newKol = {
      id: uuidv4(),
      ...createKolDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.kolRepository.create(newKol);
    return this.findOne(newKol.id);
  }

  async update(id: string, updateKolDto: UpdateKolDto): Promise<KOL> {
    const kol = await this.findOne(id);

    if (!kol) {
      throw new NotFoundException(`KOL with ID ${id} not found`);
    }

    await this.kolRepository.update(id, {
      ...updateKolDto,
      updatedAt: new Date(),
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.kolRepository.delete(id);
  }
}
