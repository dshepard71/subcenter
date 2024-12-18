import { createRouter, createWebHistory } from 'vue-router';
import UploadTeachers from '../components/UploadTeachers.vue';
const routes = [
    {
        path: '/admin',
        component: UploadTeachers,
    },
    {
        path: '/',
        component: { template: '<div>Main Page Content Goes Here</div>' },
    },
    {
        path: '/sub-coordinator',
        component: { template: '<div>Sub Coordinator Page Content Goes Here</div>' },
    },
    {
        path: '/payroll',
        component: { template: '<div>Payroll Page Content Goes Here</div>' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;