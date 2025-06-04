import React from 'react';


interface UserListProps {
  users: string[];
  host: string;
  currentUser: string;
}

const UserList: React.FC<UserListProps> = ({ users, host, currentUser }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Users className="w-5 h-5 mr-2 text-primary-500" />
        <h3 className="text-lg font-medium">Users ({users.length})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <ul className="space-y-2">
          {users.map((user) => (
            <li 
              key={user} 
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white font-medium">
                  {user.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user === currentUser ? `${user} (You)` : user}
                </p>
              </div>
              {user === host && (
                <Crown className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserList;