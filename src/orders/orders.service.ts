import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orders: Order[] = [];

  create(createOrderDto: CreateOrderDto): Order {
    this.logger.log('Creating a new order');
    const order: Order = {
      id: uuidv4(),
      ...createOrderDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.push(order);
    this.logger.debug(`Order created with id: ${order.id}`);
    return order;
  }

  findAll(): Order[] {
    this.logger.log('Retrieving all orders');
    this.logger.debug(`Number of orders: ${this.orders.length}`);
    return [...this.orders];
  }

  findOne(id: string): Order {
    this.logger.log(`Retrieving order with id: ${id}`);
    const order = this.orders.find((order) => order.id === id);
    if (!order) {
      this.logger.warn(`Order with id ${id} not found`);
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Order {
    this.logger.log(`Updating order with id: ${id}`);
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) {
      this.logger.warn(`Order with id ${id} not found for update`);
      throw new Error(`Order with id ${id} not found`);
    }
    const updatedOrder = {
      ...this.orders[index],
      ...updateOrderDto,
      updatedAt: new Date(),
    };
    this.orders[index] = updatedOrder;
    this.logger.debug(`Order with id ${id} updated successfully`);
    return updatedOrder;
  }

  remove(id: string): boolean {
    this.logger.log(`Removing order with id: ${id}`);
    const initialLength = this.orders.length;
    this.orders = this.orders.filter((order) => order.id !== id);
    const removed = initialLength > this.orders.length;
    if (removed) {
      this.logger.debug(`Order with id ${id} removed successfully`);
    } else {
      this.logger.warn(`Order with id ${id} not found for removal`);
      throw new Error(`Order with id ${id} not found`);
    }
    return removed;
  }
}
