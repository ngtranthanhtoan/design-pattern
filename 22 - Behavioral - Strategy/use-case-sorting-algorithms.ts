import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface SortResult<T> {
  sortedArray: T[];
  executionTime: number;
  comparisons: number;
  swaps: number;
  memoryUsage: number;
}

interface SortingStrategy<T> {
  sort(data: T[]): SortResult<T>;
  getTimeComplexity(): string;
  getSpaceComplexity(): string;
  getDescription(): string;
  isStable(): boolean;
  isInPlace(): boolean;
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class QuickSortStrategy<T> implements SortingStrategy<T> {
  sort(data: T[]): SortResult<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    let comparisons = 0;
    let swaps = 0;

    const sortedArray = [...data];
    
    const quickSort = (arr: T[], low: number, high: number): void => {
      if (low < high) {
        const pi = this.partition(arr, low, high, () => comparisons++, () => swaps++);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    };

    quickSort(sortedArray, 0, sortedArray.length - 1);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      sortedArray,
      executionTime: endTime - startTime,
      comparisons,
      swaps,
      memoryUsage: endMemory - startMemory
    };
  }

  private partition(arr: T[], low: number, high: number, incComparisons: () => void, incSwaps: () => void): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      incComparisons();
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          incSwaps();
        }
      }
    }

    if (i + 1 !== high) {
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      incSwaps();
    }

    return i + 1;
  }

  getTimeComplexity(): string {
    return "O(n log n) average, O(n²) worst case";
  }

  getSpaceComplexity(): string {
    return "O(log n)";
  }

  getDescription(): string {
    return "QuickSort - Divide and conquer with pivot selection";
  }

  isStable(): boolean {
    return false;
  }

  isInPlace(): boolean {
    return true;
  }
}

class MergeSortStrategy<T> implements SortingStrategy<T> {
  sort(data: T[]): SortResult<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    let comparisons = 0;
    let swaps = 0;

    const sortedArray = [...data];
    
    const mergeSort = (arr: T[], left: number, right: number): void => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        this.merge(arr, left, mid, right, () => comparisons++, () => swaps++);
      }
    };

    mergeSort(sortedArray, 0, sortedArray.length - 1);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      sortedArray,
      executionTime: endTime - startTime,
      comparisons,
      swaps,
      memoryUsage: endMemory - startMemory
    };
  }

  private merge(arr: T[], left: number, mid: number, right: number, incComparisons: () => void, incSwaps: () => void): void {
    const leftArray = arr.slice(left, mid + 1);
    const rightArray = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;

    while (i < leftArray.length && j < rightArray.length) {
      incComparisons();
      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
      }
      incSwaps();
      k++;
    }

    while (i < leftArray.length) {
      arr[k] = leftArray[i];
      i++;
      k++;
      incSwaps();
    }

    while (j < rightArray.length) {
      arr[k] = rightArray[j];
      j++;
      k++;
      incSwaps();
    }
  }

  getTimeComplexity(): string {
    return "O(n log n)";
  }

  getSpaceComplexity(): string {
    return "O(n)";
  }

  getDescription(): string {
    return "MergeSort - Divide and conquer with stable merging";
  }

  isStable(): boolean {
    return true;
  }

  isInPlace(): boolean {
    return false;
  }
}

class BubbleSortStrategy<T> implements SortingStrategy<T> {
  sort(data: T[]): SortResult<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    let comparisons = 0;
    let swaps = 0;

    const sortedArray = [...data];
    const n = sortedArray.length;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        if (sortedArray[j] > sortedArray[j + 1]) {
          [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
          swaps++;
          swapped = true;
        }
      }

      if (!swapped) {
        break; // Array is already sorted
      }
    }
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      sortedArray,
      executionTime: endTime - startTime,
      comparisons,
      swaps,
      memoryUsage: endMemory - startMemory
    };
  }

  getTimeComplexity(): string {
    return "O(n²)";
  }

  getSpaceComplexity(): string {
    return "O(1)";
  }

  getDescription(): string {
    return "BubbleSort - Simple comparison-based sorting";
  }

  isStable(): boolean {
    return true;
  }

  isInPlace(): boolean {
    return true;
  }
}

class HeapSortStrategy<T> implements SortingStrategy<T> {
  sort(data: T[]): SortResult<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    let comparisons = 0;
    let swaps = 0;

    const sortedArray = [...data];
    const n = sortedArray.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(sortedArray, n, i, () => comparisons++, () => swaps++);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      [sortedArray[0], sortedArray[i]] = [sortedArray[i], sortedArray[0]];
      swaps++;
      this.heapify(sortedArray, i, 0, () => comparisons++, () => swaps++);
    }
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      sortedArray,
      executionTime: endTime - startTime,
      comparisons,
      swaps,
      memoryUsage: endMemory - startMemory
    };
  }

  private heapify(arr: T[], n: number, i: number, incComparisons: () => void, incSwaps: () => void): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    incComparisons();
    if (left < n && arr[left] > arr[largest]) {
      largest = left;
    }

    incComparisons();
    if (right < n && arr[right] > arr[largest]) {
      largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      incSwaps();
      this.heapify(arr, n, largest, incComparisons, incSwaps);
    }
  }

  getTimeComplexity(): string {
    return "O(n log n)";
  }

  getSpaceComplexity(): string {
    return "O(1)";
  }

  getDescription(): string {
    return "HeapSort - Heap-based in-place sorting";
  }

  isStable(): boolean {
    return false;
  }

  isInPlace(): boolean {
    return true;
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class SortingContext<T> {
  private strategy: SortingStrategy<T>;

  constructor(strategy: SortingStrategy<T>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortingStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): SortResult<T> {
    console.log(`Sorting using: ${this.strategy.getDescription()}`);
    console.log(`Time Complexity: ${this.strategy.getTimeComplexity()}`);
    console.log(`Space Complexity: ${this.strategy.getSpaceComplexity()}`);
    console.log(`Stable: ${this.strategy.isStable() ? "Yes" : "No"}`);
    console.log(`In-Place: ${this.strategy.isInPlace() ? "Yes" : "No"}`);
    console.log(`Input size: ${data.length} elements`);
    
    const result = this.strategy.sort(data);
    
    console.log(`Execution time: ${result.executionTime.toFixed(2)}ms`);
    console.log(`Comparisons: ${result.comparisons}`);
    console.log(`Swaps: ${result.swaps}`);
    console.log(`Memory usage: ${(result.memoryUsage / 1024).toFixed(2)} KB`);
    console.log(`First 5 elements: [${result.sortedArray.slice(0, 5).join(', ')}]`);
    console.log(`Last 5 elements: [${result.sortedArray.slice(-5).join(', ')}]`);
    console.log("---");

    return result;
  }

  getCurrentStrategy(): SortingStrategy<T> {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstrateSortingStrategies(): void {
  console.log("=== SORTING ALGORITHMS STRATEGY DEMO ===\n");

  // Generate test data
  const generateRandomArray = (size: number): number[] => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 10000));
  };

  const testSizes = [100, 1000, 5000];
  
  testSizes.forEach(size => {
    console.log(`\n📊 Testing with ${size} elements:`);
    const testData = generateRandomArray(size);
    
    const strategies = [
      new QuickSortStrategy<number>(),
      new MergeSortStrategy<number>(),
      new BubbleSortStrategy<number>(),
      new HeapSortStrategy<number>()
    ];

    const results: Array<{ strategy: string; result: SortResult<number> }> = [];

    strategies.forEach(strategy => {
      const context = new SortingContext(strategy);
      const result = context.sort([...testData]);
      results.push({ strategy: strategy.getDescription(), result });
    });

    // Compare results
    console.log(`\n🏆 Performance Comparison for ${size} elements:`);
    console.log("Algorithm\t\t\tTime (ms)\tComparisons\tSwaps\t\tMemory (KB)");
    console.log("---------\t\t\t---------\t-----------\t-----\t\t----------");
    
    results.forEach(({ strategy, result }) => {
      const shortName = strategy.split(' - ')[0];
      console.log(`${shortName.padEnd(20)}\t${result.executionTime.toFixed(2)}\t\t${result.comparisons}\t\t${result.swaps}\t\t${(result.memoryUsage / 1024).toFixed(2)}`);
    });
  });
}

function demonstrateStrategySelection(): void {
  console.log("=== DYNAMIC STRATEGY SELECTION ===\n");

  const context = new SortingContext(new QuickSortStrategy<number>());

  const scenarios = [
    {
      name: "Small dataset (100 elements)",
      data: Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000)),
      recommendedStrategy: "BubbleSort",
      reason: "Simple and efficient for small datasets"
    },
    {
      name: "Medium dataset (1000 elements)",
      data: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000)),
      recommendedStrategy: "QuickSort",
      reason: "Good average performance"
    },
    {
      name: "Large dataset (10000 elements)",
      data: Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100000)),
      recommendedStrategy: "MergeSort",
      reason: "Guaranteed O(n log n) performance"
    },
    {
      name: "Nearly sorted data (1000 elements)",
      data: Array.from({ length: 1000 }, (_, i) => i + Math.floor(Math.random() * 10)),
      recommendedStrategy: "BubbleSort",
      reason: "Efficient for nearly sorted data"
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`Recommended: ${scenario.recommendedStrategy} - ${scenario.reason}`);
    
    // Select strategy based on scenario
    let selectedStrategy: SortingStrategy<number>;
    switch (scenario.recommendedStrategy) {
      case "QuickSort":
        selectedStrategy = new QuickSortStrategy<number>();
        break;
      case "MergeSort":
        selectedStrategy = new MergeSortStrategy<number>();
        break;
      case "BubbleSort":
        selectedStrategy = new BubbleSortStrategy<number>();
        break;
      case "HeapSort":
        selectedStrategy = new HeapSortStrategy<number>();
        break;
      default:
        selectedStrategy = new QuickSortStrategy<number>();
    }

    context.setStrategy(selectedStrategy);
    const result = context.sort([...scenario.data]);
    
    console.log(`✅ Sorted ${scenario.data.length} elements in ${result.executionTime.toFixed(2)}ms\n`);
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testSortingStrategies(): void {
  console.log("=== SORTING STRATEGY TESTS ===\n");

  const testCases = [
    {
      name: "Empty array",
      data: [],
      expected: []
    },
    {
      name: "Single element",
      data: [42],
      expected: [42]
    },
    {
      name: "Already sorted",
      data: [1, 2, 3, 4, 5],
      expected: [1, 2, 3, 4, 5]
    },
    {
      name: "Reverse sorted",
      data: [5, 4, 3, 2, 1],
      expected: [1, 2, 3, 4, 5]
    },
    {
      name: "Random array",
      data: [3, 1, 4, 1, 5, 9, 2, 6],
      expected: [1, 1, 2, 3, 4, 5, 6, 9]
    }
  ];

  const strategies = [
    new QuickSortStrategy<number>(),
    new MergeSortStrategy<number>(),
    new BubbleSortStrategy<number>(),
    new HeapSortStrategy<number>()
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: ${testCase.name}`);
    
    strategies.forEach((strategy, strategyIndex) => {
      const result = strategy.sort([...testCase.data]);
      const isCorrect = JSON.stringify(result.sortedArray) === JSON.stringify(testCase.expected);
      
      console.log(`  Strategy ${strategyIndex + 1} (${strategy.getDescription().split(' - ')[0]}): ${isCorrect ? "✅ PASS" : "❌ FAIL"}`);
      if (!isCorrect) {
        console.log(`    Expected: [${testCase.expected.join(', ')}]`);
        console.log(`    Got: [${result.sortedArray.join(', ')}]`);
      }
    });
    console.log("");
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  try {
    demonstrateSortingStrategies();
    demonstrateStrategySelection();
    testSortingStrategies();
    
    console.log("=== SORTING ALGORITHMS STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in sorting demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 