import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log('Creating a new order');
    const order = await this.prisma.order.create({
      data: {
        product: createOrderDto.product,
        price: createOrderDto.price,
      },
    });
    this.logger.debug(`Order created with id: ${order.id}`);
    return order;
  }

  async findAll() {
    this.logger.log('Retrieving all orders');
    const orders = await this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    this.logger.debug(`Number of orders: ${orders.length}`);
    return orders;
  }

  async findOne(id: string) {
    this.logger.log(`Retrieving order with id: ${id}`);
    const order = await this.prisma.order.findUnique({
      where: { id: Number(id) },
    });
    if (!order) {
      this.logger.warn(`Order with id ${id} not found`);
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(`Updating order with id: ${id}`);
    try {
      const updatedOrder = await this.prisma.order.update({
        where: { id: Number(id) },
        data: {
          product: updateOrderDto.product,
          price: updateOrderDto.price,
        },
      });
      this.logger.debug(`Order with id ${id} updated successfully`);
      return updatedOrder;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`Order with id ${id} not found for update`);
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.log(`Removing order with id: ${id}`);
    try {
      const deletedOrder = await this.prisma.order.delete({
        where: { id: Number(id) },
      });
      this.logger.debug(`Order with id ${id} removed successfully`);
      return deletedOrder;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`Order with id ${id} not found for removal`);
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }
}
