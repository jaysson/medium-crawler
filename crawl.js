const {fetchAndParser, start} = require('./processor');
const q = createQueue(fetchAndParser, (error)=>console.error(error), 5);
const root = 'https://medium.com';
start(root, q);

function createQueue(worker, errorHandler, concurrency = 1) {
    if(concurrency < 1) throw new Error('Concurrency should not be less than 1');
    // Respecting the functional nature of JS, we return an object.
    // In other languages, classes would be used for this.
    return {
        tasks: [],
        currentConcurrency: 0,
        push: function (item) {
            this.tasks.push(item);
            this.process();
        },
        process: function () {
            // When new items are added, this while loop takes care of limiting concurrency
            while (this.tasks.length > 0 && this.currentConcurrency < concurrency) {
                this.currentConcurrency++;
                this.next();
            }
        },
        next: function (prevError) {
            if (prevError) errorHandler(prevError);
            if (this.tasks.length === 0) return; // Done!
            const task = this.tasks.shift();
            // Once current task is done, next task will run automatically
            // We need to bind current object, else it will take the execution context as `this`
            worker(task, this.next.bind(this));
        }
    };
}
