import type { MigrationInterface } from 'typeorm';
import type { QueryRunner } from 'typeorm';

/**
 * Migration inicial para configurar o sistema de migrations.
 * Não altera o schema; apenas garante que a tabela de migrations exista.
 * Use este arquivo como modelo para novas migrations.
 */
export class InitialMigrationsSetup1739112000000 implements MigrationInterface {
  name = 'InitialMigrationsSetup1739112000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // No-op: schema já é criado por synchronize ou por migrations anteriores.
    // Novas migrations devem implementar up() com as alterações desejadas.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op: reversão não necessária para esta migration.
  }
}
