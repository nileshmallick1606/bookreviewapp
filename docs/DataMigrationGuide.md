# Data Migration Guide: BookReview Platform

## Introduction

This document provides comprehensive instructions for migrating data within the BookReview platform. Our application uses a file-based storage system that can be migrated between different environments or storage implementations. Follow these steps to ensure a smooth data migration process.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Storage Architecture](#understanding-the-storage-architecture)
3. [Migration Process Overview](#migration-process-overview)
4. [Preparation Steps](#preparation-steps)
5. [Running the Migration](#running-the-migration)
6. [Validating the Migration](#validating-the-migration)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Migration Scenarios](#advanced-migration-scenarios)
9. [Appendix: Command Reference](#appendix-command-reference)

## Prerequisites

Before starting the migration process, ensure you have:

- Node.js version 14 or higher installed
- Full access permissions to both source and target data directories
- Sufficient disk space for the migrated data (at least 2x the current data size)
- A backup of your current data (CRITICAL - never migrate without a backup!)
- The necessary environment variables configured (see [Environment Setup](#environment-setup))

### Environment Setup

Set the following environment variables if you want to customize the migration process:

```
DATA_SOURCE_DIR=/path/to/source/data    # Source data directory (optional, defaults to ./data)
DATA_TARGET_DIR=/path/to/target/data    # Target data directory (optional)
MIGRATION_LOG_LEVEL=info                # Log level (debug, info, warn, error)
MIGRATION_BATCH_SIZE=100                # Number of entities per batch
```

## Understanding the Storage Architecture

The BookReview platform uses a structured file-based storage system organized as follows:

```
data/
├── users/                # User entities
│   └── [user_id].json
├── books/                # Book entities
│   └── [book_id].json
├── reviews/              # Review entities
│   └── [review_id].json
├── favorites/            # User favorites
│   └── [user_id].json
├── locks/                # Lock files for concurrency control
│   └── [resource_id].lock
└── indexes/              # Index files for efficient lookups
    ├── users/
    │   ├── email-index.json
    │   └── username-index.json
    ├── books/
    │   ├── title-index.json
    │   ├── author-index.json
    │   ├── genre-index.json
    │   └── top-rated.json
    └── reviews/
        ├── book-reviews.json
        └── user-reviews.json
```

Each entity is stored as a separate JSON file, and indexes are maintained for efficient lookup operations.

## Migration Process Overview

The migration process consists of the following high-level steps:

1. **Preparation**: Backup data and set up target environment
2. **Storage Services Initialization**: Initialize the storage service provider
3. **User Migration**: Migrate user entities and their indexes
4. **Book Migration**: Migrate book entities and their indexes
5. **Review Migration**: Migrate review entities and their indexes
6. **Index Rebuilding**: Rebuild all indexes to ensure consistency
7. **Validation**: Verify the integrity of migrated data
8. **Cleanup**: Remove temporary files and handle any errors

## Preparation Steps

### 1. Backup Your Data

Always create a backup before migrating:

```bash
# Create a timestamped backup directory
mkdir -p ./backups/$(date +%Y%m%d_%H%M%S)
cp -r ./data ./backups/$(date +%Y%m%d_%H%M%S)/
```

### 2. Check Disk Space

Ensure you have sufficient disk space for the migration:

```bash
# Check available disk space
df -h .
```

### 3. Validate Source Data

Run validation checks on your source data:

```bash
npm run validate:data
```

## Running the Migration

The BookReview platform provides a dedicated script for data migration:

```bash
cd backend
npm run migrate:storage
```

This script:
1. Initializes storage services
2. Validates existing data
3. Migrates users, books, and reviews
4. Rebuilds all indexes
5. Verifies the migration

### Migration Options

You can customize the migration by passing options:

```bash
# Migrate only specific entity types
npm run migrate:storage -- --entities=users,books

# Perform a dry run (no actual changes)
npm run migrate:storage -- --dry-run

# Force overwrite of existing data
npm run migrate:storage -- --force

# Verbose logging
npm run migrate:storage -- --verbose
```

### Phased Migration

For large datasets, consider using a phased approach:

```bash
# Phase 1: Migrate users
npm run migrate:storage -- --entities=users

# Phase 2: Migrate books
npm run migrate:storage -- --entities=books

# Phase 3: Migrate reviews
npm run migrate:storage -- --entities=reviews

# Phase 4: Rebuild indexes
npm run migrate:storage -- --rebuild-indexes-only
```

## Validating the Migration

After migration, validate the data integrity:

### 1. Run Automated Tests

```bash
npm run test:integration
```

### 2. Verify Entity Counts

```bash
npm run count:entities
```

This should show matching counts between source and target storage.

### 3. Validate Random Samples

Manually check a few random entities to ensure they were properly migrated:

```bash
# View a specific user
npm run view:entity -- --type=user --id=user_id_here

# View a specific book
npm run view:entity -- --type=book --id=book_id_here
```

### 4. Test Application Functionality

Start the application using the new data storage and verify that all features work correctly:

```bash
npm run dev
```

## Troubleshooting

### Common Issues and Solutions

#### Missing Indexes

**Issue**: Searches are slow or returning incomplete results after migration.

**Solution**: Rebuild all indexes:

```bash
npm run rebuild:indexes
```

#### Inconsistent Entity References

**Issue**: Foreign key relationships (e.g., reviews referring to non-existent books) are broken.

**Solution**: Run the reference validator:

```bash
npm run validate:references
```

#### File Permissions

**Issue**: Permission denied errors during migration.

**Solution**: Check and fix permissions on the data directories:

```bash
# Fix permissions
chmod -R 755 ./data
```

#### Migration Timeout

**Issue**: Migration process times out for large datasets.

**Solution**: Increase the Node.js memory limit and use phased migration:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run migrate:storage -- --batch-size=50
```

## Advanced Migration Scenarios

### Migrating to a New Server

When migrating the entire application to a new server:

1. Set up the new server with the same environment
2. Copy the entire `data` directory to the new server
3. Verify file permissions on the new server
4. Run the migration validation script:

```bash
npm run validate:migration
```

### Schema Upgrades

When migrating to a new data schema version:

1. Update the application to the new version
2. Run the schema migration script:

```bash
npm run migrate:schema -- --from-version=1.0 --to-version=2.0
```

### Database Migration

To migrate from file-based storage to a database:

1. Configure the database connection in your environment
2. Run the database migration script:

```bash
npm run migrate:to-database -- --type=postgres
```

## Appendix: Command Reference

### Migration Scripts

| Command | Description |
|---------|-------------|
| `npm run migrate:storage` | Run the full migration process |
| `npm run validate:data` | Validate data integrity |
| `npm run rebuild:indexes` | Rebuild all indexes |
| `npm run count:entities` | Count entities in storage |
| `npm run view:entity` | View a specific entity |
| `npm run validate:migration` | Validate a completed migration |
| `npm run migrate:schema` | Migrate to a new schema version |
| `npm run migrate:to-database` | Migrate to a database backend |

### Important Files

| File Path | Description |
|-----------|-------------|
| `backend/scripts/migrateToNewStorage.ts` | Main migration script |
| `backend/src/services/storageServiceProvider.ts` | Storage service provider |
| `backend/src/services/storage/baseStorage.service.ts` | Base storage service |
| `backend/src/services/indexing/index.manager.ts` | Index management service |

## Conclusion

Following this migration guide should ensure a smooth and error-free data migration process for your BookReview platform. Always remember to back up your data before starting any migration process and validate thoroughly after completion.

For additional support, contact the platform administrators or refer to the technical documentation in the project repository.

---

*Last Updated: August 29, 2025*
