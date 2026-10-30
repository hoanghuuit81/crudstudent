import type { Knex } from "knex";
import { db } from "../../database/connection.js";
import { getOffset } from "../../common/pagination.js";
import type { ClassInput, ClassQuery, ClassRecord, ClassView } from "./class.types.js";

function classListQuery(connection: Knex = db) {
  return connection("classes as c")
    .leftJoin("students as s", "s.class_id", "c.id")
    .select("c.id", "c.code", "c.name", "c.description", "c.created_at", "c.updated_at")
    .count({ studentCount: "s.id" })
    .groupBy("c.id", "c.code", "c.name", "c.description", "c.created_at", "c.updated_at");
}

export const classRepository = {
  async findAll(query: ClassQuery): Promise<{ items: ClassView[]; total: number }> {
    const applySearch = <T extends Knex.QueryBuilder>(builder: T): T => {
      if (query.q) {
        builder.where((nested) => {
          const keyword = `%${query.q}%`;
          nested.whereRaw("?? LIKE ?", ["c.code", keyword]).orWhereRaw("?? LIKE ?", ["c.name", keyword]);
        });
      }
      return builder;
    };

    const listQuery = applySearch(classListQuery())
      .orderBy("c.id", "desc")
      .limit(query.limit)
      .offset(getOffset(query));

    const countQuery = applySearch(db("classes as c")).count<{ total: string }[]>("c.id as total").first();
    const [rows, count] = await Promise.all([listQuery, countQuery]);

    return {
      items: rows.map((row) => ({ ...row, studentCount: Number(row.studentCount) })) as ClassView[],
      total: Number(count?.total ?? 0)
    };
  },

  async findById(id: number): Promise<ClassView | undefined> {
    const row = await classListQuery().where("c.id", id).first();
    return row ? ({ ...row, studentCount: Number(row.studentCount) } as ClassView) : undefined;
  },

  async create(input: ClassInput): Promise<number> {
    const [id] = await db<ClassRecord>("classes").insert({
      ...input,
      description: input.description || null
    });
    if (id === undefined) throw new Error("Không nhận được ID lớp vừa tạo");
    return id;
  },

  async update(id: number, input: Partial<ClassInput>): Promise<number> {
    return db<ClassRecord>("classes")
      .where({ id })
      .update({ ...input, updated_at: db.fn.now() });
  },

  async remove(id: number): Promise<number> {
    return db<ClassRecord>("classes").where({ id }).del();
  }
};
