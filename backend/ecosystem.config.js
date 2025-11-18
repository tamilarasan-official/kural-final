module.exports = {
    apps: [{
        // Application Configuration
        name: 'kural-api',
        script: './src/server.js',

        // Cluster Mode - Multi-core scaling for 1L+ users
        instances: 6, // Use 6 cores for stability
        exec_mode: 'cluster',

        // Environment Variables
        env: {
            NODE_ENV: 'development',
            PORT: 5000,
            WEB_CONCURRENCY: 12
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 5000,
            WEB_CONCURRENCY: 12
        },

        // Performance Optimizations
        max_memory_restart: '2G', // Restart if memory exceeds 2GB
        node_args: '--max-old-space-size=4096 --optimize-for-size', // 4GB heap

        // Restart Strategy
        autorestart: true,
        watch: false, // Disable in production
        max_restarts: 10,
        min_uptime: '10s',
        restart_delay: 4000,

        // Error Handling
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_file: './logs/pm2-combined.log',
        time: true,
        merge_logs: true,

        // Graceful Shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,
        shutdown_with_message: true,

        // Health Monitoring
        instance_var: 'INSTANCE_ID',

        // Advanced Options
        cron_restart: '0 2 * * *', // Restart daily at 2 AM (optional)

        // Source Map Support
        source_map_support: true,

        // Logging
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        combine_logs: true,

        // Process Management
        increment_var: 'PORT',

        // Performance Metrics
        pmx: true,

        // Interpreter
        interpreter: 'node',
        interpreter_args: '--harmony'
    }],

    // Deployment Configuration (Optional)
    deploy: {
        production: {
            user: 'deploy',
            host: ['178.16.137.247'],
            ref: 'origin/main',
            repo: 'git@github.com:tamilarasan-official/kural-backend.git',
            path: '/var/www/kural-api',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            ssh_options: 'StrictHostKeyChecking=no'
        },
        staging: {
            user: 'deploy',
            host: ['178.16.137.247'],
            ref: 'origin/develop',
            repo: 'git@github.com:tamilarasan-official/kural-backend.git',
            path: '/var/www/kural-api-staging',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
            ssh_options: 'StrictHostKeyChecking=no'
        }
    }
};