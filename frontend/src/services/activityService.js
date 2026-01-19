

const MOCK_ACTIVITIES = [
    {
        id: '1',
        userId: 'u2',
        userName: 'Sarah Wilson',
        userAvatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=E11D48&color=fff',
        action: 'edited',
        targetId: '1',
        targetTitle: 'Q4 Strategy Document',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        timeAgo: '5 minutes ago'
    },
    {
        id: '2',
        userId: 'u3',
        userName: 'Mike Chen',
        userAvatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=4F46E5&color=fff',
        action: 'commented on',
        targetId: '2',
        targetTitle: 'Product Roadmap 2024',
        content: 'Added feedback on timeline',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        timeAgo: '15 minutes ago'
    },
    {
        id: '3',
        userId: 'u4',
        userName: 'John Doe',
        userAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
        action: 'shared',
        targetId: '3',
        targetTitle: 'Engineering Specs',
        content: 'Shared with Design Team',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        timeAgo: '1 hour ago'
    },
    {
        id: '4',
        userId: 'u5',
        userName: 'Lisa Park',
        userAvatar: 'https://ui-avatars.com/api/?name=Lisa+Park&background=D97706&color=fff',
        action: 'created',
        targetId: '4',
        targetTitle: 'Marketing Campaign Brief',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        timeAgo: '2 hours ago'
    }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
    getRecentActivities: async () => {
        await delay(300);
        return [...MOCK_ACTIVITIES];
    },

    getActiveUsers: async () => {
        await delay(200);
        // Mock active users based on recent activity
        return [
            { id: 'u2', name: 'Sarah Wilson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=E11D48&color=fff', status: 'editing' },
            { id: 'u3', name: 'Mike Chen', avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=4F46E5&color=fff', status: 'viewing' },
            { id: 'u4', name: 'Tom Lee', avatar: 'https://ui-avatars.com/api/?name=Tom+Lee&background=059669&color=fff', status: 'online' }
        ];
    }
};
