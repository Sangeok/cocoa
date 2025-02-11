import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { KolService } from './kol.service';
import { CreateKolDto, UpdateKolDto } from './dto/kol.dto';

@Controller('kols')
export class KolController {
  constructor(private readonly kolService: KolService) {}

  @Get()
  async findAll() {
    return this.kolService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.kolService.findOne(id);
  }

  @Post()
  async create(@Body() createKolDto: CreateKolDto) {
    return this.kolService.create(createKolDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateKolDto: UpdateKolDto) {
    return this.kolService.update(id, updateKolDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.kolService.remove(id);
  }
} 