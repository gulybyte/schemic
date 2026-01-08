// @ts-nocheck
import { inspect } from "node:util";
import { createRequire } from "node:module";
import {
    BoundExcluded,
    BoundIncluded,
    DateTime,
    Decimal,
    Duration,
    d,
    FileRef,
    GeometryCollection,
    GeometryLine,
    GeometryMultiLine,
    GeometryMultiPoint,
    GeometryMultiPolygon,
    GeometryPoint,
    GeometryPolygon,
    Range,
    RecordId,
    RecordIdRange,
    r,
    StringRecordId,
    surql,
    Table,
    Uuid,
    u,
} from "surrealdb";

// function print(header: string, values: any[]) {
//     console.log(header);
//     values.forEach((value) => {
//         console.log("-", value);
//     });
//     console.log();
// }

// console.log();
// print("Table:", [new Table("client"), new Table("order"), new Table("product")]);

// print("RecordId:", [
//     new RecordId("user", "msanchezdev"),
//     new RecordId("order", 123456),
//     new RecordId("product", "01KC8FMT9XX38MN93RPZGQ8HTP"),
//     new RecordId("product", "123456"),
// ]);
// print("StringRecordId:", [
//     new StringRecordId("user:msanchezdev"),
//     new StringRecordId("order:01KC8FMT9XX38MN93RPZGQ8HTP"),
//     new StringRecordId("product:123456"),
//     r`user:msanchezdev`,
// ]);
// print("RecordIdRange:", [
//     new RecordIdRange("order", new BoundIncluded(1), new BoundIncluded(10)),
//     new RecordIdRange("order", new BoundIncluded(1), new BoundExcluded(10)),
//     new RecordIdRange("order", new BoundExcluded(1), new BoundIncluded(10)),
//     new RecordIdRange("order", new BoundExcluded(1), new BoundExcluded(10)),
// ]);
// print("DateTime:", [
//     new DateTime(),
//     new DateTime(new Date("2025-01-01T00:00:00Z")),
//     d`2025-01-01T00:00:00Z`,
// ]);
// print("Uuid:", [
//     new Uuid("123e4567-e89b-12d3-a456-426614174000"),
//     u`123e4567-e89b-12d3-a456-426614174000`,
// ]);
// print("Range:", [
//     new Range(new BoundIncluded(1), new BoundIncluded(10)),
//     new Range(new BoundIncluded(1), new BoundExcluded(10)),
//     new Range(new BoundExcluded(1), new BoundIncluded(10)),
//     new Range(new BoundExcluded(1), new BoundExcluded(10)),
// ]);
// print("FileRef:", [
//     new FileRef("root", "hello.txt"),
//     new FileRef("images", "/users/msanchezdev/profile.jpg"),
// ]);
// print("Duration:", [
//     new Duration("1h30m14s"),
//     new Duration("2h15m30s"),
//     new Duration("3h20m45s"),
//     new Duration("4h25m00s"),
//     new Duration("5h30m15s"),
// ]);
// print("Decimal:", [new Decimal("123"), new Decimal("123.456"), new Decimal("1.256789e12")]);
// console.log("--------------------------------");
// const id = new RecordId("user", "john_doe");
// const name = "John Doe";
// const age = 18;
// const salary = new Decimal("1.5");
// const birthDate = new DateTime();
// const active = true;
// const contactInfo = [
//     {
//         primary: "1234567890",
//         countryCode: "+1",
//     },
//     {
//         secondary: "0987654321",
//         countryCode: "+2",
//     },
// ];
// const sessionDuration = new Duration("1h30m14s");
// const query = surql`
//   CREATE ${id} CONTENT {
//     name: ${name},
//     age: ${age},
//     salaery: ${salary},
//     birth_date: ${birthDate},
//     active: ${active},
//     contact_info: ${contactInfo},
//     session_duration: ${sessionDuration},
//   }
// `;
// console.log(query);

// console.log("\n--------------------------------");

// print("GeometryPoint:", [new GeometryPoint([1, 2]), new GeometryPoint([3, 4])]);
// const line = new GeometryLine([
//     new GeometryPoint([5, 6]),
//     new GeometryPoint([7, 8]),
//     new GeometryPoint([9, 10]),
// ]);

// const longLine = new GeometryLine([
//     new GeometryPoint([1, 2]),
//     new GeometryPoint([3, 4]),
//     new GeometryPoint([5, 6]),
//     new GeometryPoint([7, 8]),
//     new GeometryPoint([9, 10]),
//     new GeometryPoint([11, 12]),
//     new GeometryPoint([13, 14]),
// ]);
// print("GeometryLine:", [
//     new GeometryLine([new GeometryPoint([1, 2]), new GeometryPoint([3, 4])]),
//     line,
//     inspect(line, { colors: true, depth: 1 }),
//     inspect(line, { colors: true }),
//     inspect(line, { colors: true, compact: false }),
//     inspect(line, { colors: true, compact: true }),
//     inspect(longLine, { colors: true }),
//     inspect(longLine, { colors: true }),
// ]);

// const polygon = new GeometryPolygon([
//     new GeometryLine([
//         new GeometryPoint([0, 0]),
//         new GeometryPoint([0, 1]),
//         new GeometryPoint([1, 1]),
//     ]),
// ]);
// const longerPolygon = new GeometryPolygon([
//     new GeometryLine([
//         new GeometryPoint([0, 0]),
//         new GeometryPoint([0, 1]),
//         new GeometryPoint([1, 1]),
//     ]),
//     new GeometryLine([
//         new GeometryPoint([1, 1]),
//         new GeometryPoint([1, 2]),
//         new GeometryPoint([2, 2]),
//         new GeometryPoint([2, 1]),
//     ]),
//     new GeometryLine([
//         new GeometryPoint([2, 1]),
//         new GeometryPoint([2, 2]),
//         new GeometryPoint([3, 2]),
//         new GeometryPoint([3, 1]),
//     ]),
// ]);
// print("GeometryPolygon:", [
//     inspect(polygon, { colors: true, depth: 1 }),
//     inspect(polygon, { colors: true, depth: 2 }), // default
//     inspect(polygon, { colors: true, depth: 3 }),
//     inspect(longerPolygon, { colors: true, depth: 1 }),
//     inspect(longerPolygon, { colors: true, depth: 2 }), // default
//     inspect(longerPolygon, { colors: true, depth: 3 }),
// ]);

// const multiPoint = new GeometryMultiPoint([new GeometryPoint([1, 2]), new GeometryPoint([3, 4])]);
// print("GeometryMultiPoint:", [
//     inspect(multiPoint, { colors: true, depth: 1 }),
//     inspect(multiPoint, { colors: true, depth: 2 }), // default
//     new GeometryMultiPoint([
//         new GeometryPoint([1, 2]),
//         new GeometryPoint([3, 4]),
//         new GeometryPoint([5, 6]),
//         new GeometryPoint([7, 8]),
//     ]),
// ]);

// const multiLine = new GeometryMultiLine([
//     new GeometryLine([new GeometryPoint([1, 2]), new GeometryPoint([3, 4])]),
//     new GeometryLine([new GeometryPoint([5, 6]), new GeometryPoint([7, 8])]),
//     new GeometryLine([new GeometryPoint([9, 10]), new GeometryPoint([11, 12])]),
// ]);
// print("GeometryMultiLine:", [
//     inspect(multiLine, { colors: true, depth: 1 }),
//     inspect(multiLine, { colors: true, depth: 2 }), // default
//     inspect(multiLine, { colors: true, depth: 3 }),
// ]);

// const multiPolygon = new GeometryMultiPolygon([
//     new GeometryPolygon([
//         new GeometryLine([
//             new GeometryPoint([1, 2]),
//             new GeometryPoint([3, 4]),
//             new GeometryPoint([5, 6]),
//             new GeometryPoint([7, 8]),
//         ]),
//         new GeometryLine([
//             new GeometryPoint([9, 10]),
//             new GeometryPoint([11, 12]),
//             new GeometryPoint([13, 14]),
//             new GeometryPoint([15, 16]),
//         ]),
//     ]),
//     new GeometryPolygon([
//         new GeometryLine([
//             new GeometryPoint([17, 18]),
//             new GeometryPoint([19, 20]),
//             new GeometryPoint([21, 22]),
//             new GeometryPoint([23, 24]),
//         ]),
//     ]),
// ]);
// print("GeometryMultiPolygon:", [
//     inspect(multiPolygon, { colors: true, depth: 1 }),
//     inspect(multiPolygon, { colors: true, depth: 2 }), // default
//     inspect(multiPolygon, { colors: true, depth: 3 }),
// ]);

// const collection = new GeometryCollection([
//     new GeometryPoint([1, 2]),
//     new GeometryLine([new GeometryPoint([3, 4]), new GeometryPoint([5, 6])]),
//     new GeometryPolygon([
//         new GeometryLine([new GeometryPoint([7, 8]), new GeometryPoint([9, 10])]),
//     ]),
//     new GeometryMultiPoint([
//         new GeometryPoint([11, 12]),
//         new GeometryPoint([13, 14]),
//         new GeometryPoint([15, 16]),
//         new GeometryPoint([17, 18]),
//     ]),
//     new GeometryMultiLine([
//         new GeometryLine([new GeometryPoint([19, 20]), new GeometryPoint([21, 22])]),
//         new GeometryLine([new GeometryPoint([23, 24]), new GeometryPoint([25, 26])]),
//     ]),
//     new GeometryMultiPolygon([
//         new GeometryPolygon([
//             new GeometryLine([new GeometryPoint([27, 28]), new GeometryPoint([29, 30])]),
//         ]),
//     ]),
// ]);
// print("GeometryCollection:", [
//     inspect(collection, { colors: true, depth: 1 }),
//     inspect(collection, { colors: true, depth: 2 }), // default
//     inspect(collection, { colors: true, depth: 3 }),
//     inspect(collection, { colors: true, depth: 4 }),
// ]);

const req = createRequire(import.meta.url);
console.log("app surrealdb", req.resolve("surrealdb"));