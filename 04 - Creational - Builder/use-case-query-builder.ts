// ============================================================================
// QUERY BUILDER - Complex Database Query Construction
// ============================================================================

import { exit } from "process";

// Query interfaces and types
interface SQLQuery {
  readonly sql: string;
  readonly parameters: any[];
  readonly type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  readonly estimatedCost?: number;
}

interface ElasticsearchQuery {
  readonly query: any;
  readonly sort?: any[];
  readonly size?: number;
  readonly from?: number;
  readonly aggregations?: any;
  readonly highlight?: any;
}

interface JoinCondition {
  table: string;
  condition: string;
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL OUTER';
}

interface WhereCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL';
  value?: any;
  connector: 'AND' | 'OR';
}

interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

// ============================================================================
// SQL QUERY BUILDER
// ============================================================================

class SQLQueryBuilder {
  private selectFields: string[] = [];
  private fromTable: string = '';
  private joins: JoinCondition[] = [];
  private whereConditions: WhereCondition[] = [];
  private orderByFields: OrderByClause[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private groupByFields: string[] = [];
  private havingConditions: WhereCondition[] = [];
  private parameters: any[] = [];
  private parameterIndex: number = 1;

  select(fields: string | string[]): this {
    if (typeof fields === 'string') {
      if (fields.trim() === '*') {
        this.selectFields = ['*'];
      } else {
        this.selectFields.push(fields);
      }
    } else {
      this.selectFields.push(...fields);
    }
    return this;
  }

  from(table: string): this {
    if (!table || table.trim() === '') {
      throw new Error('Table name cannot be empty');
    }
    this.fromTable = table.trim();
    return this;
  }

  join(table: string, condition: string, type: JoinCondition['type'] = 'INNER'): this {
    if (!table || !condition) {
      throw new Error('Table and condition are required for join');
    }
    this.joins.push({ table: table.trim(), condition: condition.trim(), type });
    return this;
  }

  leftJoin(table: string, condition: string): this {
    return this.join(table, condition, 'LEFT');
  }

  rightJoin(table: string, condition: string): this {
    return this.join(table, condition, 'RIGHT');
  }

  innerJoin(table: string, condition: string): this {
    return this.join(table, condition, 'INNER');
  }

  where(field: string, operator: WhereCondition['operator'], value?: any): this;
  where(field: string, value: any): this;
  where(field: string, operatorOrValue: any, value?: any): this {
    let operator: WhereCondition['operator'];
    let actualValue: any;

    if (value === undefined) {
      operator = '=';
      actualValue = operatorOrValue;
    } else {
      operator = operatorOrValue;
      actualValue = value;
    }

    this.whereConditions.push({
      field: field.trim(),
      operator,
      value: actualValue,
      connector: 'AND'
    });

    // Add parameter for parameterized query
    if (actualValue !== undefined && operator !== 'IS NULL' && operator !== 'IS NOT NULL') {
      this.parameters.push(actualValue);
    }

    return this;
  }

  orWhere(field: string, operator: WhereCondition['operator'], value?: any): this;
  orWhere(field: string, value: any): this;
  orWhere(field: string, operatorOrValue: any, value?: any): this {
    // Set the last condition to OR
    if (this.whereConditions.length > 0) {
      this.whereConditions[this.whereConditions.length - 1].connector = 'OR';
    }
    return this.where(field, operatorOrValue, value);
  }

  whereIn(field: string, values: any[]): this {
    this.whereConditions.push({
      field: field.trim(),
      operator: 'IN',
      value: values,
      connector: 'AND'
    });
    this.parameters.push(values);
    return this;
  }

  whereBetween(field: string, min: any, max: any): this {
    this.whereConditions.push({
      field: field.trim(),
      operator: 'BETWEEN',
      value: [min, max],
      connector: 'AND'
    });
    this.parameters.push(min, max);
    return this;
  }

  whereNull(field: string): this {
    this.whereConditions.push({
      field: field.trim(),
      operator: 'IS NULL',
      connector: 'AND'
    });
    return this;
  }

  whereNotNull(field: string): this {
    this.whereConditions.push({
      field: field.trim(),
      operator: 'IS NOT NULL',
      connector: 'AND'
    });
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByFields.push({ field: field.trim(), direction });
    return this;
  }

  groupBy(fields: string | string[]): this {
    if (typeof fields === 'string') {
      this.groupByFields.push(fields.trim());
    } else {
      this.groupByFields.push(...fields.map(f => f.trim()));
    }
    return this;
  }

  having(field: string, operator: WhereCondition['operator'], value?: any): this {
    this.havingConditions.push({
      field: field.trim(),
      operator,
      value,
      connector: 'AND'
    });
    if (value !== undefined) {
      this.parameters.push(value);
    }
    return this;
  }

  limit(count: number): this {
    if (count < 0) {
      throw new Error('Limit count cannot be negative');
    }
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    if (count < 0) {
      throw new Error('Offset count cannot be negative');
    }
    this.offsetValue = count;
    return this;
  }

  build(): SQLQuery {
    if (!this.fromTable) {
      throw new Error('FROM table is required');
    }
    if (this.selectFields.length === 0) {
      throw new Error('SELECT fields are required');
    }

    const parts: string[] = [];

    // SELECT clause
    parts.push(`SELECT ${this.selectFields.join(', ')}`);

    // FROM clause
    parts.push(`FROM ${this.fromTable}`);

    // JOIN clauses
    for (const join of this.joins) {
      parts.push(`${join.type} JOIN ${join.table} ON ${join.condition}`);
    }

    // WHERE clause
    if (this.whereConditions.length > 0) {
      const whereClause = this.buildWhereClause(this.whereConditions);
      parts.push(`WHERE ${whereClause}`);
    }

    // GROUP BY clause
    if (this.groupByFields.length > 0) {
      parts.push(`GROUP BY ${this.groupByFields.join(', ')}`);
    }

    // HAVING clause
    if (this.havingConditions.length > 0) {
      const havingClause = this.buildWhereClause(this.havingConditions);
      parts.push(`HAVING ${havingClause}`);
    }

    // ORDER BY clause
    if (this.orderByFields.length > 0) {
      const orderByClause = this.orderByFields
        .map(o => `${o.field} ${o.direction}`)
        .join(', ');
      parts.push(`ORDER BY ${orderByClause}`);
    }

    // LIMIT clause
    if (this.limitValue !== undefined) {
      parts.push(`LIMIT ${this.limitValue}`);
    }

    // OFFSET clause
    if (this.offsetValue !== undefined) {
      parts.push(`OFFSET ${this.offsetValue}`);
    }

    const sql = parts.join(' ');

    return Object.freeze({
      sql,
      parameters: [...this.parameters],
      type: 'SELECT',
      estimatedCost: this.estimateQueryCost()
    });
  }

  private buildWhereClause(conditions: WhereCondition[]): string {
    const clauses: string[] = [];
    
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      let clause = '';

      switch (condition.operator) {
        case 'IN':
          const placeholders = condition.value.map(() => '?').join(', ');
          clause = `${condition.field} IN (${placeholders})`;
          break;
        case 'NOT IN':
          const notInPlaceholders = condition.value.map(() => '?').join(', ');
          clause = `${condition.field} NOT IN (${notInPlaceholders})`;
          break;
        case 'BETWEEN':
          clause = `${condition.field} BETWEEN ? AND ?`;
          break;
        case 'IS NULL':
          clause = `${condition.field} IS NULL`;
          break;
        case 'IS NOT NULL':
          clause = `${condition.field} IS NOT NULL`;
          break;
        default:
          clause = `${condition.field} ${condition.operator} ?`;
      }

      if (i > 0) {
        clause = `${condition.connector} ${clause}`;
      }

      clauses.push(clause);
    }

    return clauses.join(' ');
  }

  private estimateQueryCost(): number {
    let cost = 1;
    
    // Base cost for table scan
    cost += this.joins.length * 2; // Each join increases cost
    cost += this.whereConditions.length * 0.5; // WHERE conditions help reduce cost
    cost += this.orderByFields.length * 1.5; // ORDER BY increases cost
    
    if (this.groupByFields.length > 0) cost += 2; // GROUP BY is expensive
    if (this.limitValue && this.limitValue < 100) cost *= 0.5; // LIMIT reduces cost
    
    return Math.round(cost * 10) / 10;
  }

  // Static factory methods for common queries
  static select(fields: string | string[]): SQLQueryBuilder {
    return new SQLQueryBuilder().select(fields);
  }

  static selectAll(): SQLQueryBuilder {
    return new SQLQueryBuilder().select('*');
  }
}

// ============================================================================
// ELASTICSEARCH QUERY BUILDER
// ============================================================================

class ElasticsearchQueryBuilder {
  private indexName?: string;
  private queryObject: any = { match_all: {} };
  private filterConditions: any[] = [];
  private sortFields: any[] = [];
  private sizeValue?: number;
  private fromValue?: number;
  private aggregationsObject?: any;
  private highlightConfig?: any;
  private sourceFields?: string[];

  index(indexName: string): this {
    if (!indexName || indexName.trim() === '') {
      throw new Error('Index name cannot be empty');
    }
    this.indexName = indexName.trim();
    return this;
  }

  match(field: string, value: any): this {
    this.queryObject = {
      match: {
        [field]: value
      }
    };
    return this;
  }

  matchPhrase(field: string, phrase: string): this {
    this.queryObject = {
      match_phrase: {
        [field]: phrase
      }
    };
    return this;
  }

  multiMatch(value: any, fields: string[]): this {
    this.queryObject = {
      multi_match: {
        query: value,
        fields: fields
      }
    };
    return this;
  }

  term(field: string, value: any): this {
    this.queryObject = {
      term: {
        [field]: value
      }
    };
    return this;
  }

  terms(field: string, values: any[]): this {
    this.queryObject = {
      terms: {
        [field]: values
      }
    };
    return this;
  }

  range(field: string, conditions: { gte?: any; lte?: any; gt?: any; lt?: any }): this {
    this.queryObject = {
      range: {
        [field]: conditions
      }
    };
    return this;
  }

  bool(): BoolQueryBuilder {
    return new BoolQueryBuilder(this);
  }

  filter(field: string, conditions: any): this {
    if (Array.isArray(conditions)) {
      this.filterConditions.push({
        terms: { [field]: conditions }
      });
    } else {
      this.filterConditions.push({
        term: { [field]: conditions }
      });
    }
    return this;
  }

  filterRange(field: string, conditions: { gte?: any; lte?: any; gt?: any; lt?: any }): this {
    this.filterConditions.push({
      range: { [field]: conditions }
    });
    return this;
  }

  sort(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.sortFields.push({ [field]: { order: direction } });
    return this;
  }

  size(count: number): this {
    if (count < 0) {
      throw new Error('Size cannot be negative');
    }
    this.sizeValue = count;
    return this;
  }

  from(offset: number): this {
    if (offset < 0) {
      throw new Error('From offset cannot be negative');
    }
    this.fromValue = offset;
    return this;
  }

  source(fields: string[]): this {
    this.sourceFields = fields;
    return this;
  }

  aggregate(name: string, aggregation: any): this {
    if (!this.aggregationsObject) {
      this.aggregationsObject = {};
    }
    this.aggregationsObject[name] = aggregation;
    return this;
  }

  highlight(config: any): this {
    this.highlightConfig = config;
    return this;
  }

  // Common aggregation helpers
  avgAggregation(name: string, field: string): this {
    return this.aggregate(name, { avg: { field } });
  }

  sumAggregation(name: string, field: string): this {
    return this.aggregate(name, { sum: { field } });
  }

  termsAggregation(name: string, field: string, size: number = 10): this {
    return this.aggregate(name, { terms: { field, size } });
  }

  dateHistogram(name: string, field: string, interval: string): this {
    return this.aggregate(name, { 
      date_histogram: { 
        field, 
        calendar_interval: interval 
      } 
    });
  }

  build(): ElasticsearchQuery {
    let query: any = {};

    // Build the main query
    if (this.filterConditions.length > 0) {
      query.bool = {
        must: this.queryObject,
        filter: this.filterConditions
      };
    } else {
      query = this.queryObject;
    }

    const result: any = { query };

    // Add optional clauses
    if (this.sortFields.length > 0) {
      result.sort = this.sortFields;
    }

    if (this.sizeValue !== undefined) {
      result.size = this.sizeValue;
    }

    if (this.fromValue !== undefined) {
      result.from = this.fromValue;
    }

    if (this.aggregationsObject) {
      result.aggs = this.aggregationsObject;
    }

    if (this.highlightConfig) {
      result.highlight = this.highlightConfig;
    }

    if (this.sourceFields) {
      result._source = this.sourceFields;
    }

    return Object.freeze(result);
  }

  // Static factory methods
  static search(): ElasticsearchQueryBuilder {
    return new ElasticsearchQueryBuilder();
  }

  static matchAll(): ElasticsearchQueryBuilder {
    return new ElasticsearchQueryBuilder();
  }
}

// Boolean query builder for complex Elasticsearch queries
class BoolQueryBuilder {
  private parent: ElasticsearchQueryBuilder;
  private mustClauses: any[] = [];
  private mustNotClauses: any[] = [];
  private shouldClauses: any[] = [];
  private filterClauses: any[] = [];

  constructor(parent: ElasticsearchQueryBuilder) {
    this.parent = parent;
  }

  must(query: any): this {
    this.mustClauses.push(query);
    return this;
  }

  mustNot(query: any): this {
    this.mustNotClauses.push(query);
    return this;
  }

  should(query: any): this {
    this.shouldClauses.push(query);
    return this;
  }

  filter(query: any): this {
    this.filterClauses.push(query);
    return this;
  }

  done(): ElasticsearchQueryBuilder {
    const boolQuery: any = {};

    if (this.mustClauses.length > 0) boolQuery.must = this.mustClauses;
    if (this.mustNotClauses.length > 0) boolQuery.must_not = this.mustNotClauses;
    if (this.shouldClauses.length > 0) boolQuery.should = this.shouldClauses;
    if (this.filterClauses.length > 0) boolQuery.filter = this.filterClauses;

    (this.parent as any).queryObject = { bool: boolQuery };
    return this.parent;
  }
}

// ============================================================================
// QUERY ANALYZER
// ============================================================================

class QueryAnalyzer {
  static analyzeSQLQuery(query: SQLQuery): { optimization: string; warnings: string[] } {
    const warnings: string[] = [];
    let optimization = 'Good';

    if (query.sql.includes('SELECT *')) {
      warnings.push('Avoid SELECT * - specify only needed columns');
      optimization = 'Poor';
    }

    if (query.estimatedCost && query.estimatedCost > 5) {
      warnings.push('High estimated cost - consider adding indexes');
      optimization = 'Poor';
    }

    if (!query.sql.includes('LIMIT') && !query.sql.includes('WHERE')) {
      warnings.push('Consider adding LIMIT to prevent large result sets');
      optimization = 'Fair';
    }

    return { optimization, warnings };
  }

  static analyzeElasticsearchQuery(query: ElasticsearchQuery): { optimization: string; suggestions: string[] } {
    const suggestions: string[] = [];
    let optimization = 'Good';

    if (query.size && query.size > 1000) {
      suggestions.push('Large result set - consider pagination');
      optimization = 'Fair';
    }

    if (!query.sort && query.size && query.size > 100) {
      suggestions.push('Add sorting for consistent results');
    }

    if (query.query.match_all && !query.query.bool) {
      suggestions.push('Consider adding filters to improve performance');
    }

    return { optimization, suggestions };
  }
}

// ============================================================================
// USAGE DEMONSTRATIONS
// ============================================================================

// Usage Example - Following the documented API exactly
async function demonstrateQueryBuilder(): Promise<void> {
  console.log('=== QUERY BUILDER DEMO ===');
  console.log('Following the documented API pattern:\n');

  // SQL Query Example
  console.log('--- SQL Query Building ---');
  
  try {
    const sqlQuery = new SQLQueryBuilder()
      .select(['u.name', 'u.email', 'p.bio'])
      .from('users u')
      .join('profiles p', 'u.id = p.user_id')
      .where('u.status', '=', 'active')
      .where('u.created_at', '>=', '2024-01-01')
      .orderBy('u.created_at', 'DESC')
      .limit(50)
      .offset(100)
      .build();

    console.log('SQL Query:');
    console.log(`SQL: ${sqlQuery.sql}`);
    console.log(`Parameters: [${sqlQuery.parameters.join(', ')}]`);
    console.log(`Type: ${sqlQuery.type}`);
    console.log(`Estimated Cost: ${sqlQuery.estimatedCost}`);

    // Analyze query
    const sqlAnalysis = QueryAnalyzer.analyzeSQLQuery(sqlQuery);
    console.log(`Optimization: ${sqlAnalysis.optimization}`);
    if (sqlAnalysis.warnings.length > 0) {
      console.log(`Warnings: ${sqlAnalysis.warnings.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ SQL query error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Elasticsearch Query Example
  console.log('--- Elasticsearch Query Building ---');
  
  try {
    const elasticQuery = new ElasticsearchQueryBuilder()
      .index('products')
      .match('name', 'laptop')
      .filterRange('price', { gte: 500, lte: 2000 })
      .filter('category', ['electronics', 'computers'])
      .sort('price', 'asc')
      .size(20)
      .from(0)
      .termsAggregation('brands', 'brand.keyword')
      .avgAggregation('avg_price', 'price')
      .highlight({
        fields: {
          name: {},
          description: {}
        }
      })
      .build();

    console.log('Elasticsearch Query:');
    console.log(JSON.stringify(elasticQuery, null, 2));

    // Analyze query
    const esAnalysis = QueryAnalyzer.analyzeElasticsearchQuery(elasticQuery);
    console.log(`\nOptimization: ${esAnalysis.optimization}`);
    if (esAnalysis.suggestions.length > 0) {
      console.log(`Suggestions: ${esAnalysis.suggestions.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Elasticsearch query error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Complex Boolean Query Example
  console.log('--- Complex Boolean Query ---');
  
  try {
    const complexQuery = ElasticsearchQueryBuilder
      .search()
      .index('articles')
      .bool()
        .must({ match: { title: 'design patterns' } })
        .must({ range: { publish_date: { gte: '2024-01-01' } } })
        .should({ match: { author: 'john doe' } })
        .should({ match: { tags: 'typescript' } })
        .mustNot({ term: { status: 'draft' } })
        .filter({ term: { category: 'programming' } })
        .done()
      .sort('publish_date', 'desc')
      .size(10)
      .source(['title', 'author', 'publish_date', 'excerpt'])
      .build();

    console.log('Complex Boolean Query:');
    console.log(JSON.stringify(complexQuery, null, 2));

  } catch (error) {
    console.error('❌ Complex query error:', error instanceof Error ? error.message : String(error));
  }

  console.log(`\n✅ Successfully demonstrated query builders for SQL and Elasticsearch`);
}

// Testing Example
async function testQueryBuilder(): Promise<void> {
  console.log('\n=== QUERY BUILDER TESTS ===');
  
  // Test 1: Required field validation
  console.log('Test 1 - Required field validation:');
  try {
    new SQLQueryBuilder().build();
    console.log('❌ Should have thrown error for missing FROM table');
  } catch (error) {
    console.log('✅ Correctly validates required FROM table');
  }

  // Test 2: Parameter handling
  console.log('\nTest 2 - Parameter handling:');
  const query = new SQLQueryBuilder()
    .select('*')
    .from('users')
    .where('name', 'John')
    .where('age', '>', 18)
    .build();

  console.log(`✅ Parameters properly collected: ${query.parameters.length === 2}`);
  console.log(`✅ Query parameterized: ${query.sql.includes('?')}`);

  // Test 3: Method chaining
  console.log('\nTest 3 - Fluent interface:');
  const fluentQuery = SQLQueryBuilder
    .select(['name', 'email'])
    .from('users')
    .where('active', true)
    .orderBy('name')
    .limit(10)
    .build();

  console.log(`✅ Fluent interface works: ${fluentQuery.sql.includes('SELECT name, email')}`);

  // Test 4: Elasticsearch query structure
  console.log('\nTest 4 - Elasticsearch query structure:');
  const esQuery = ElasticsearchQueryBuilder
    .search()
    .index('test')
    .match('field', 'value')
    .size(10)
    .build();

  console.log(`✅ ES query has proper structure: ${esQuery.query && esQuery.size === 10}`);

  // Test 5: Query cost estimation
  console.log('\nTest 5 - Query optimization:');
  const expensiveQuery = new SQLQueryBuilder()
    .select('*')
    .from('large_table')
    .join('another_table', 'large_table.id = another_table.ref_id')
    .join('third_table', 'another_table.id = third_table.ref_id')
    .orderBy('created_at', 'DESC')
    .build();

  console.log(`✅ Cost estimation works: ${expensiveQuery.estimatedCost! > 1}`);

  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateQueryBuilder();
  await testQueryBuilder();
  exit(0);
})();

export {
  SQLQueryBuilder,
  ElasticsearchQueryBuilder,
  BoolQueryBuilder,
  QueryAnalyzer,
  SQLQuery,
  ElasticsearchQuery
}; 