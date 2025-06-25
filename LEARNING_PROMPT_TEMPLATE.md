# Learning Project Prompt Template 🎯

Use this template to create structured, practical learning projects for any technical topic.

## Base Prompt Template

```
I want to create a comprehensive learning repository for [TOPIC_NAME] with hands-on examples and practical implementations. This folder will help me master [TOPIC_NAME] through structured learning and real-world practice.

### Project Structure Requirements:

**Folder Naming Convention**: `[OrderNumber] - [Category] - [Specific Topic]`
- Example: `1 - Clean Code - SOLID Principles`
- Example: `2 - Clean Architecture - Layered Architecture` 
- Example: `3 - AI Agents - ReAct Pattern`

**Each topic folder should contain:**

1. **`introduction.md`** - Core concepts and theory
   - What is [specific topic]?
   - Key principles/concepts
   - Benefits and drawbacks
   - When to use/avoid
   - Structure diagrams or explanations

2. **`use-case.md`** - Real-world applications
   - Practical scenarios where this applies
   - Industry examples
   - Common implementations
   - Best practices and anti-patterns
   - Modern alternatives when applicable

3. **Individual implementation files** named: `use-case-[specific-example].ts`
   - Each file should focus on ONE practical example
   - Include comprehensive comments explaining the concepts
   - Provide usage demonstrations
   - Include testing examples right after each implementation
   - Add `import { exit } from "process"` and `exit(0)` at the end

4. **`index.ts`** - Overview and navigation
   - Lists all available use cases
   - Provides npm script commands for each example
   - Brief description of what each example demonstrates

### Technical Setup Requirements:

1. **Update package.json scripts** for easy execution:
   ```json
   "[topic]": "ts-node \"[folder]/index.ts\"",
   "[topic]:[example1]": "ts-node \"[folder]/use-case-[example1].ts\"",
   "[topic]:[example2]": "ts-node \"[folder]/use-case-[example2].ts\""
   ```

2. **TypeScript support** with proper types and interfaces
3. **Real-world, runnable examples** - not just theory
4. **Comprehensive error handling** and edge cases
5. **Modern best practices** and current industry standards

### Content Quality Standards:

✅ **Practical Examples**: Each use case should solve a real-world problem
✅ **Runnable Code**: All examples must execute immediately with `npm run` commands  
✅ **Educational Value**: Includes both usage and testing demonstrations
✅ **Professional Quality**: Production-ready code with proper error handling
✅ **Modular Design**: Each concept separated into focused files
✅ **Clear Navigation**: Easy to understand and find specific examples

### Learning Approach:

The project should support this learning path:
1. Read `introduction.md` for theoretical foundation
2. Review `use-case.md` for practical applications
3. Run `npm run [topic]` to see available examples
4. Study individual use case files for specific implementations  
5. Execute examples: `npm run [topic]:[example]`
6. Experiment and modify the code

### Implementation Guidelines:

- **Focus on practical value** - every example should teach something immediately applicable
- **Include multiple approaches** - show different ways to solve the same problem
- **Real-world complexity** - don't oversimplify, show actual implementation challenges
- **Testing mindset** - include examples of how to test these concepts
- **Modern practices** - use current tools, patterns, and best practices
- **Clear documentation** - extensive comments explaining the "why" not just the "how"

During the implementation process:
1. Start with the first topic and create all files
2. Ask me to confirm each topic before moving to the next
3. Show practical, working examples that I can run immediately
4. Separate each major concept into its own use-case file for focused learning
5. Ensure all examples have proper TypeScript types and error handling

The goal is to create a reference that I can return to anytime I need to implement or understand [TOPIC_NAME] concepts in real projects.
```

## Topic-Specific Variations

### For Clean Code:
Replace `[TOPIC_NAME]` with "Clean Code principles" and focus on:
- SOLID principles (each as separate use case)
- Refactoring techniques  
- Code smells and fixes
- Naming conventions
- Function design
- Class design

### For Clean Architecture:
Replace `[TOPIC_NAME]` with "Clean Architecture patterns" and focus on:
- Layered architecture
- Hexagonal architecture
- Dependency inversion
- Use cases and entities
- Interface adapters
- Infrastructure layer

### For AI Agents:
Replace `[TOPIC_NAME]` with "AI Agent patterns" and focus on:
- ReAct (Reasoning + Acting) pattern
- Tool-using agents
- Multi-agent systems
- Agent orchestration
- Memory and state management
- LangChain/LangGraph patterns

### For System Design:
Replace `[TOPIC_NAME]` with "System Design patterns" and focus on:
- Scalability patterns
- Database design patterns
- Caching strategies
- Load balancing
- Microservices patterns
- API design patterns

## Example Usage

```
I want to create a comprehensive learning repository for Clean Code principles with hands-on examples and practical implementations. This folder will help me master Clean Code through structured learning and real-world practice.

[Continue with the base template above, replacing [TOPIC_NAME] with "Clean Code principles"]
```

## Benefits of This Approach

✅ **Structured Learning** - Consistent format across all topics
✅ **Practical Focus** - Runnable examples, not just theory  
✅ **Easy Reference** - Quick access to specific concepts
✅ **Professional Quality** - Production-ready implementations
✅ **Modular Design** - Study one concept at a time
✅ **Testing Included** - Learn how to verify implementations
✅ **Modern Standards** - Current best practices and tools

This template ensures every learning project you create will be comprehensive, practical, and immediately useful in real-world development! 