var crossoverRate = 0.7;
var mutationRate = 0.001;
var dictionary = {
	'0000': 0,
	'0001': 1,
	'0010': 2,
	'0011': 3,
	'0100': 4,
	'0101': 5,
	'0110': 6,
	'0111': 7,
	'1000': 8,
	'1001': 9,
	'1010': '+',
	'1011': '-',
	'1100': '*',
	'1101': '/'
};

function Chromosome(param) {
	var chromo;
	if (typeof param === 'string') {
		chromo = param;
	}
	else if (typeof param === 'number') {
		chromo = generateSequence(param);
	}

	function generateSequence(geneSequenceSize) {
		var chromo = '';
		geneSequenceSize = geneSequenceSize || 10;
		for (var i = 0; i < geneSequenceSize; i++) {
			chromo += Math.random() < 0.5 ? '0': '1';
		}
		return chromo;
	}

	this.print = function () {
		console.log(chromo);
	};
	this.read = function () {
		return chromo;
	};
	this.write = function (newChromo) {
		chromo = newChromo;
	};
	this.mutate = function (mutationRate) {
		var rate = mutationRate || 0.001;
		for (var i = 0; i < chromo.length; i++) {
			if (Math.random() < mutationRate) {
				chromo = chromo.substring(0, i) + (+!+chromo[i]) + chromo.substring(i + 1);
				// console.log(chromo + ' mutated at ' + i);
			}
		}
	};
}

function GeneticPool(goal, poolSize, geneSize, geneSequenceSize) {
	var pool = [], solutions = [], gen = 1;
	// Generate Genetic Pool
	for (var i = 0; i < poolSize; i++) {
		pool.push(new Chromosome(geneSize * geneSequenceSize));
	}

	function decode(chromosome) {
		var sequence = [], gene;
		for (var i = 0; i < geneSize; i++) {
			gene = chromosome.read().substring(i * geneSequenceSize, (i + 1) * geneSequenceSize);
			// console.log(gene + ' ' + dictionary[gene]);
			// strip undefined values
			if (dictionary[gene] !== undefined) {
				sequence.push(dictionary[gene]);
			}
		}
		// console.log(sequence);
		// Final clean up (num -> operator -> num -> operator -> num)
		var num = true, processed = [];
		sequence.forEach(function (value) {
			if (num && !isNaN(value)) {
				processed.push(value);
				num = false;
			}
			else if (!num && isNaN(value)) {
				processed.push(value);
				num = true;
			}
		});
		if (isNaN(processed[processed.length - 1])) {
			processed.pop();
		}
		// console.log('processed: ' + processed.join(''));
		return processed.join(''); // return decodedValue
	}

	// Fitness Function
	function fitness(decodedValue) {
		var value = eval(decodedValue);
		if (isNaN(value)) {
			return 0;
		}
		return Math.abs(1 / (goal - value));
	}

	// Selection two chromosomes based on fitness result
	function selection(roulette) {
		var selected = [], totalFitness, random;
		totalFitness = roulette.reduce(function (a, b) {
			return a + b;
		});
		while (selected.length < 2) {
			random = Math.random() * totalFitness;
			for (var i = 0; i < roulette.length; i++) {
				if (random < roulette[i]) {
					if (selected.length === 0 || i !== selected[0]) {
						selected.push(i);
					}
					break;
				}
				random -= roulette[i];
			}
		}
		return selected;
	}

	function crossover(selected, rate) {
		var coRate = rate || 0.7;
		var chromo1 = selected[0].read();
		var chromo2 = selected[1].read();
		var crossed = [];
		crossed[0] = new Chromosome(chromo1);
		crossed[1] = new Chromosome(chromo2);

		if (Math.random() < coRate) {
			// swap at random point greater than 0
			var pivot = Math.floor(Math.random() * (chromo1.length - 1)) + 1;
			var temp = chromo1.substring(pivot);
			// console.log('Pivot: ' + pivot);
			crossed[0].write(chromo1.substring(0, pivot) + chromo2.substring(pivot));
			crossed[1].write(chromo2.substring(0, pivot) + chromo1.substring(pivot));
		}
		// console.log(crossed[0].read());
		// console.log(crossed[1].read());
		return crossed;
	}

	// Main run loop
	function run() {
		var roulette = [], newPool = [];
		pool.forEach(function (chromosome) {
			var decoded = decode(chromosome),
				fitnessScore = fitness(decoded);
			if (fitnessScore === Infinity) {
				solutions.push(decoded);
				return true;
			}
			roulette.push(fitnessScore);
		});

		// Fill Pool
		for (var i = 0; i < poolSize / 2; i++) {
			var selected = selection(roulette).map(function (index) {
				return pool[index];
			});
			// crossover
			var crossed = crossover(selected);
			// mutate
			crossed[0].mutate(mutationRate);
			crossed[1].mutate(mutationRate);
			// fill new pool
			newPool.push(crossed[0]);
			newPool.push(crossed[1]);
		}

		return newPool;
	}

	function print() {
		pool.forEach(function (chromosome) {
			var decoded = decode(chromosome);
			console.log(chromosome.read() + ': ' + decoded);
		});
	}

	this.start = function (count) {
		if (count === undefined) {
			// run until solution found
			while (solutions.length === 0) {
				console.log('Generation ' + gen);
				print();
				pool = run();
				if (pool === true) {
					break;
				}
				gen++;
			}
			console.log('Solutions: ' + solutions);
		}
		else {
			for (var i = 0; i < count; i++) {
				console.log('Generation ' + gen);
				print();
				pool = run();
				if (pool === true) {
					break;
				}
				gen++;
			}
			console.log('Solutions: ' + solutions);
		}
	};
}

var gen = new GeneticPool(42, 10, 9, 4);
gen.start();
