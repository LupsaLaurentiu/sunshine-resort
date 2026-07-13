import { Injectable } from '@nestjs/common';
import type { Admin } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({
      where: {
        id,
      },
    });
  }

  async updateLastLogin(id: string): Promise<Admin> {
    return this.prisma.admin.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}