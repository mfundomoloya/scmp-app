import React, { useContext, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const { notifications, markAsRead } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = notifications
    .filter((notification) => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true; // 'all' filter
    })
    .filter((notification) =>
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    },
    {}
  );

  const markAllAsRead = () => {
    filteredNotifications
      .filter((n) => !n.read)
      .forEach((n) => markAsRead(n._id));
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/notifications-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Notifications</h1>
            <div className="text-sm font-medium text-gray-600">
              {filteredNotifications.filter((n) => !n.read).length} unread
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === 'read'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Read
              </button>
            </div>

            <div className="flex w-full md:w-auto space-x-2">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />

              {filteredNotifications.some((n) => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="whitespace-nowrap px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {Object.keys(groupedNotifications).length > 0 ? (
              Object.entries(groupedNotifications)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([date, dayNotifications]) => (
                  <div key={date} className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>

                    <AnimatePresence>
                      {dayNotifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`p-4 border-l-4 rounded-md shadow-sm flex justify-between items-start ${
                            notification.read
                              ? 'bg-gray-50 border-gray-300'
                              : 'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <div className="flex-1">
                            <p
                              className={`${
                                notification.read
                                  ? 'text-gray-600'
                                  : 'text-gray-800 font-medium'
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                notification.createdAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>

                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="ml-4 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))
            ) : (
              <div className="text-center py-16">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 mb-1">
                  No notifications found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search or filter criteria.'
                    : filter !== 'all'
                    ? `You don't have any ${filter} notifications.`
                    : 'You have no notifications at this time.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination placeholder - for future implementation */}
          {filteredNotifications.length > 10 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-md bg-blue-600 text-white">
                  1
                </button>
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  3
                </button>
                <span className="px-2 text-gray-500">...</span>
                <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
