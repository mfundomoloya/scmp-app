import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';

const NotificationToast = () => {
    const { notifications, markAsRead } = useContext(NotificationContext);
    const { user } = useContext(AuthContext);

    if (!user || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications
        .filter((n) => !n.read)
        .map((notification) => (
          <div
            key={notification._id}
            className="bg-blue-500 text-white p-4 rounded shadow-lg flex justify-between items-center max-w-sm"
          >
            <span>{notification.message}</span>
            <button
              onClick={() => markAsRead(notification._id)}
              className="ml-4 bg-white text-blue-500 px-2 py-1 rounded hover:bg-gray-200"
            >
              Dismiss
            </button>
          </div>
        ))}
    </div>
  );
};

export default NotificationToast;