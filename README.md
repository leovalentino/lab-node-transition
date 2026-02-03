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
