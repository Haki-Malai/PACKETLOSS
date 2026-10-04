import { main } from '../server/dev';
// A shared edit may restart the Lambda emulators at the same time as this process.
// Retry startup while they return; nodemon still handles build errors on the next save.
for (let attempt = 1; ; attempt += 1) {
    try {
        await main();
        break;
    } catch (error) {
        if (attempt >= 20) throw error;
        const message = error instanceof Error ? error.message : 'Unknown startup failure';
        console.error(`Game startup waiting for local services (${attempt}/20): ${message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}
