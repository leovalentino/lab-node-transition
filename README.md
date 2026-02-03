# NestJS Orders API + Fastify Logging API

This project contains two separate APIs:
1. A NestJS Orders CRUD API (port 3000)
2. A Fastify high-performance logging API with Prisma ORM (port 3001)

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Set up Prisma database
npm run prisma:generate
npm run prisma:dbpush

# Start NestJS Orders API (port 3000)
npm run start:dev

# In another terminal, start Fastify Logging API (port 3001)
npm run fastify:dev
```

## 📊 Fastify Logging API

A lightweight, high-performance REST API built with Fastify, TypeScript, and Prisma ORM using SQLite.

### Endpoints

**POST /logs** - Create a new access log
```bash
curl -X POST http://localhost:3001/logs \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0"
  }'
```

**GET /stats** - Get statistics grouped by userAgent
```bash
curl http://localhost:3001/stats
```

### Database Schema

The SQLite database contains an `AccessLog` table with:
- `id` (autoincrement)
- `ip` (string)
- `timestamp` (datetime, defaults to now)
- `userAgent` (string)

### Performance Considerations

The Fastify API uses async/await for all database operations to avoid blocking the Node.js Event Loop, ensuring high concurrency and low latency.

## 🗄️ Prisma ORM Integration

Prisma is a modern TypeScript ORM that provides type-safe database access, migrations, and a powerful query builder. It's similar to Spring Data JPA in the Java ecosystem but with a more explicit and type-safe approach.

### Key Features

1. **Type-Safe Database Client**: Auto-generated TypeScript types for all database models
2. **Declarative Schema**: Database schema defined in `prisma/schema.prisma`
3. **Migrations**: Version-controlled database schema changes
4. **Query Builder**: Fluent API for building complex queries

### Prisma vs Spring Data JPA Comparison

| Aspect | Prisma (TypeScript) | Spring Data JPA (Java) |
|--------|---------------------|------------------------|
| **Schema Definition** | Declarative `.prisma` file | JPA annotations in entity classes |
| **Type Safety** | Compile-time TypeScript types | Runtime reflection |
| **Query Building** | Method chaining with auto-completion | JPQL or method name derivation |
| **Migrations** | Built-in migration tool (`prisma migrate`) | Flyway/Liquibase or Hibernate auto-DDL |
| **Relations** | Explicit relation fields | `@OneToMany`, `@ManyToOne` annotations |
| **Transactions** | `$transaction()` method | `@Transactional` annotation |

### Database Models

The project uses two main models:

**Order Model** (for NestJS Orders API)
```prisma
model Order {
  id        Int      @id @default(autoincrement())
  product   String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**AccessLog Model** (for Fastify Logging API)
```prisma
model AccessLog {
  id        Int      @id @default(autoincrement())
  ip        String
  userAgent String?
  timestamp DateTime @default(now())
}
```

### Usage in NestJS Services

Prisma is injected as a service using dependency injection, similar to how `EntityManager` or `JpaRepository` is injected in Spring Boot:

```typescript
// Spring Boot equivalent: @Autowired private OrderRepository orderRepository;
constructor(private prisma: PrismaService) {}

async findAll() {
  // Equivalent to JPA: orderRepository.findAll(Sort.by("createdAt").descending());
  return await this.prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

### Common Operations

| Operation | Prisma | Spring Data JPA |
|-----------|--------|-----------------|
| **Create** | `prisma.order.create({ data })` | `orderRepository.save(order)` |
| **Find All** | `prisma.order.findMany()` | `orderRepository.findAll()` |
| **Find by ID** | `prisma.order.findUnique({ where: { id } })` | `orderRepository.findById(id)` |
| **Update** | `prisma.order.update({ where: { id }, data })` | `orderRepository.save(existingOrder)` |
| **Delete** | `prisma.order.delete({ where: { id } })` | `orderRepository.deleteById(id)` |
| **Count** | `prisma.order.count()` | `orderRepository.count()` |

### Error Handling

Prisma throws specific error codes that can be caught and converted to appropriate HTTP responses:

```typescript
try {
  return await this.prisma.order.update({ where: { id }, data });
} catch (error) {
  if (error.code === 'P2025') { // Record not found
    throw new NotFoundException(`Order with ID ${id} not found`);
  }
  throw error;
}
```

### Database Setup Commands

```bash
# Generate Prisma Client (similar to compiling JPA entities)
npm run prisma:generate

# Create and apply migrations (similar to Flyway/Liquibase)
npm run prisma:migrate

# Push schema changes directly (development only)
npm run prisma:dbpush

# Open Prisma Studio (web-based database browser)
npm run prisma:studio
```

### Environment Configuration

Database connection is configured via environment variables in `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

This is similar to Spring Boot's `application.properties`:
```properties
spring.datasource.url=jdbc:sqlite:dev.db
```

### Advantages for Spring Developers

1. **Explicit Queries**: No "magic" method name parsing - queries are explicit and type-checked
2. **No Runtime Reflection**: All types are known at compile time
3. **Migration History**: Built-in migration tracking with rollback support
4. **Database Agnostic**: Same code works with SQLite, PostgreSQL, MySQL, etc.
5. **TypeScript Integration**: Full IDE autocompletion and type checking

### Production Considerations

1. **Connection Pooling**: Prisma Client includes built-in connection pooling
2. **Transaction Management**: Use `prisma.$transaction()` for complex operations
3. **Query Optimization**: Prisma provides tools for analyzing and optimizing queries
4. **Database Views**: Support for database views and raw SQL when needed

### Learning Resources

- [Prisma Documentation](https://www.prisma.io/docs/) - Official docs
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma) - Integration guide
- [Type-Safe Database Access](https://www.prisma.io/blog) - Blog articles

## 🛠️ NestJS Orders API

[Previous NestJS documentation remains valid]

The NestJS API runs on port 3000 with the same endpoints as before.

## 🛠️ API Examples

### Create an Order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Laptop",
    "price": 1299.99
  }'
```

### Get All Orders
```bash
curl http://localhost:3000/orders
```

### Get Specific Order
```bash
curl http://localhost:3000/orders/{id}
```

### Update an Order
```bash
curl -X PATCH http://localhost:3000/orders/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1199.99
  }'
```

### Delete an Order
```bash
curl -X DELETE http://localhost:3000/orders/{id}
```

> **Note**: Replace `{id}` with the actual order ID returned from the create operation.

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point (like Spring Boot's main class)
├── app.module.ts          # Root module (@SpringBootApplication equivalent)
├── orders/                # Feature module (like a Spring @ComponentScan package)
│   ├── orders.controller.ts   # REST controller (@RestController)
│   ├── orders.service.ts      # Business logic layer (@Service)
│   ├── orders.module.ts       # Feature module (@Configuration)
│   ├── dto/                   # Data Transfer Objects
│   │   ├── create-order.dto.ts   # Validation DTO (like @Valid)
│   │   └── update-order.dto.ts
│   └── entities/               # Domain models (like JPA entities)
│       └── order.entity.ts
```

## ⚡ Fastify vs. Thread-per-Request (Tomcat) Architecture

### Fastify (Node.js Event Loop)
- **Single-threaded Event Loop**: Fastify runs on Node.js, which uses a single-threaded event loop to handle all incoming requests asynchronously.
- **Non-blocking I/O**: When a request requires I/O operations (database queries, file system access, network calls), Node.js delegates these tasks to the system kernel and continues processing other requests.
- **High Concurrency**: Can handle thousands of concurrent connections with minimal memory overhead because it doesn't create a new thread per request.
- **Callback/Promise-based**: Uses async/await and promises to manage asynchronous operations without blocking the main thread.

### Tomcat (Thread-per-Request)
- **Multi-threaded**: Creates a new thread for each incoming request, which remains blocked until the request is fully processed.
- **Blocking I/O**: If a request performs I/O, its thread is blocked, waiting for the operation to complete before it can handle another request.
- **Resource Intensive**: Each thread consumes memory (typically 1MB+ per thread), limiting the number of concurrent connections (often to a few hundred).
- **Context Switching**: High thread counts lead to significant CPU overhead from context switching between threads.

### Key Differences
| Aspect | Fastify (Node.js) | Tomcat (Java) |
|--------|-------------------|---------------|
| **Concurrency Model** | Event-driven, single-threaded | Thread-per-request, multi-threaded |
| **I/O Handling** | Non-blocking, asynchronous | Blocking, synchronous |
| **Memory Usage** | Low (shared heap) | High (per-thread stack) |
| **Max Concurrent Connections** | Tens of thousands | Hundreds to thousands |
| **Best For** | I/O-heavy applications, real-time apps | CPU-intensive computations, legacy synchronous code |

### Example Scenario: Database Query
- **Fastify**: The event loop initiates the database query and immediately moves to handle the next request. When the query completes, a callback places the result in the event queue for processing.
- **Tomcat**: A dedicated thread waits idly for the database response, unable to serve other requests during this time.

This makes Fastify ideal for I/O-bound microservices where high throughput and low latency are critical, while Tomcat may be better suited for CPU-intensive applications that benefit from parallel processing.

## 🔄 Spring Boot to NestJS Concept Mapping

| Spring Boot Concept | NestJS Equivalent | Example |
|---------------------|-------------------|---------|
| `@RestController` | `@Controller()` | `@Controller('orders')` |
| `@GetMapping` | `@Get()` | `@Get(':id')` |
| `@PostMapping` | `@Post()` | `@Post()` |
| `@Service` | `@Injectable()` | `@Injectable()` |
| `@Autowired` | Constructor Injection | `constructor(private ordersService: OrdersService)` |
| `@Configuration` | `@Module()` | `@Module({ imports: [], controllers: [], providers: [] })` |
| `@ComponentScan` | Module imports | `imports: [OrdersModule]` |
| `@Valid` + JSR-303 | `class-validator` decorators | `@IsNotEmpty()`, `@IsPositive()` |
| `@SpringBootApplication` | `@Module()` + `NestFactory.create()` | `AppModule` + `bootstrap()` |
| SLF4J/Logback | Built-in `Logger` | `private readonly logger = new Logger(OrdersService.name)` |
| Application.properties | Environment variables/config files | Use `@nestjs/config` package |
| Spring Data JPA | TypeORM/Prisma (not included here) | In-memory array for demo |

## 🏗️ Dependency Injection Comparison

### Spring Boot
```java
@Service
public class OrdersService {
    // Spring manages DI
}

@RestController
public class OrdersController {
    @Autowired
    private OrdersService ordersService;
}
```

### NestJS
```typescript
@Injectable()
export class OrdersService {
    // NestJS manages DI
}

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
    // TypeScript type system enables automatic resolution
}
```

Both frameworks use constructor injection by default, promoting testability and loose coupling.

## 📝 Validation Patterns

### Spring Boot (JSR-303)
```java
public class CreateOrderDto {
    @NotBlank
    private String product;
    
    @Positive
    private BigDecimal price;
}
```

### NestJS (class-validator)
```typescript
export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    product: string;

    @IsNumber()
    @IsPositive()
    price: number;
}
```

Both approaches use decorators/annotations for declarative validation. NestJS requires `app.useGlobalPipes(new ValidationPipe())` in `main.ts` (similar to `@Valid` in Spring).

## 📊 Logging Comparison

### Spring Boot (SLF4J)
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrdersService {
    private static final Logger log = LoggerFactory.getLogger(OrdersService.class);
    
    public Order createOrder(CreateOrderDto dto) {
        log.info("Creating a new order");
        // ...
        log.debug("Order created with id: {}", order.getId());
    }
}
```

### NestJS (Built-in Logger)
```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    
    create(createOrderDto: CreateOrderDto): Order {
        this.logger.log('Creating a new order');
        // ...
        this.logger.debug(`Order created with id: ${order.id}`);
    }
}
```

Both provide structured logging with different log levels (log, debug, warn, error).

## 🔌 REST API Endpoints

| Method | Endpoint | Description | Spring Boot Equivalent |
|--------|----------|-------------|------------------------|
| POST | `/orders` | Create new order | `@PostMapping("/orders")` |
| GET | `/orders` | Get all orders | `@GetMapping("/orders")` |
| GET | `/orders/{id}` | Get order by ID | `@GetMapping("/orders/{id}")` |
| PATCH | `/orders/{id}` | Update order | `@PatchMapping("/orders/{id}")` |
| DELETE | `/orders/{id}` | Delete order | `@DeleteMapping("/orders/{id}")` |

## 🧪 Testing (Not Implemented Here)

In Spring Boot, you'd use `@SpringBootTest`, `@WebMvcTest`, and Mockito. In NestJS:

```typescript
// Similar to @WebMvcTest
describe('OrdersController', () => {
    let controller: OrdersController;
    
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [OrdersService],
        }).compile();
        
        controller = module.get<OrdersController>(OrdersController);
    });
});
```

## 📦 Key Dependencies

| Purpose | Spring Boot Starter | NestJS Package |
|---------|---------------------|----------------|
| Web Framework | `spring-boot-starter-web` | `@nestjs/platform-express` |
| Core Framework | `spring-boot-starter` | `@nestjs/core`, `@nestjs/common` |
| Validation | `spring-boot-starter-validation` | `class-validator`, `class-transformer` |
| Testing | `spring-boot-starter-test` | `@nestjs/testing` |
| Build Tool | Maven/Gradle | Nest CLI + npm scripts |

## ⚡ Performance Considerations

- **Cold Start**: NestJS/Node.js typically starts faster than Spring Boot JVM
- **Memory Usage**: Node.js uses less memory than JVM for similar workloads
- **Concurrency**: Spring uses thread-per-request; Node.js uses event loop (non-blocking I/O)
- **Type Safety**: Both provide compile-time checking (Java vs TypeScript)

## 🚨 Common Pitfalls for Spring Developers

1. **Asynchronous by Default**: Node.js is non-blocking. Use `async/await` instead of synchronous patterns.
2. **No Thread Safety Concerns**: Single-threaded event loop eliminates many concurrency issues.
3. **Different Error Handling**: Use try/catch with async functions instead of checked exceptions.
4. **Package Management**: npm vs Maven/Gradle – understand semantic versioning in package.json.
5. **Configuration**: Environment variables vs `.properties`/`.yml` files.

## 🔗 Next Steps for Production

1. Add database integration (TypeORM/Prisma – similar to Spring Data JPA)
2. Implement authentication (@nestjs/passport – similar to Spring Security)
3. Add OpenAPI/Swagger documentation (@nestjs/swagger)
4. Set up configuration management (@nestjs/config)
5. Implement health checks, metrics, and logging aggregation

## 📚 Learning Resources

- [NestJS Documentation](https://docs.nestjs.com/) – Official docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) – Master TypeScript
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

This project serves as a learning bridge for Spring Boot developers transitioning to Node.js. Feel free to explore the code and experiment with modifications.

---

*Built with ❤️ using NestJS – The progressive Node.js framework for building efficient, reliable and scalable server-side applications.*
