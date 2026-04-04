/**
 * Database entity interface. For
 * APIs that will return records
 * containing a uuid in an id field
 * and a name. More complex records
 * can be created from this base.
 */
export interface IDBEntity {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}
