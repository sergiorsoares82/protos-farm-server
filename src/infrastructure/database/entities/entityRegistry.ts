/**
 * Registry for entity classes, used to break circular dependencies between entities.
 * Entities register themselves on load; relations resolve the target entity lazily
 * when TypeORM builds metadata (after all modules are loaded).
 */
const registry = new Map<string, Function>();

export function registerEntity(name: string, entity: Function): void {
  registry.set(name, entity);
}

export function getEntity<T extends Function>(name: string): T {
  const entity = registry.get(name);
  if (!entity) {
    throw new Error(`Entity "${name}" not registered. Ensure it is imported before TypeORM initializes.`);
  }
  return entity as T;
}
