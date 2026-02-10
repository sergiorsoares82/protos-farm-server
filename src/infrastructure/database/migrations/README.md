# Migrations do banco de dados

As migrations são executadas pelo TypeORM e registradas na tabela `migrations`.

## Comandos (na pasta `server`)

- **Executar pendentes:** `npm run migration:run`
- **Reverter a última:** `npm run migration:revert`

## Como criar uma nova migration

1. Crie um arquivo nesta pasta com o padrão: `{timestamp}-DescricaoDaAlteracao.ts`
   - Exemplo: `1739112100000-AddColumnXToTableY.ts`
   - Use um timestamp único (ex.: `Date.now()`).

2. Implemente a interface `MigrationInterface`:

```ts
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnXToTableY1739112100000 implements MigrationInterface {
  name = 'AddColumnXToTableY1739112100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "table_y"
      ADD COLUMN "x" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "table_y"
      DROP COLUMN "x"
    `);
  }
}
```

3. Rode `npm run migration:run` para aplicar.

## Produção

Em produção, desative `synchronize` no `typeorm.config.ts` e use apenas migrations para alterar o schema.
