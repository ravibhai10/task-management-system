import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';

export default function GroupManagement({ userId }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPasscode, setNewGroupPasscode] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setUser, navigate } = useContext(AuthContext);

  useEffect(() => {
    fetchUserGroups();
  }, [userId]);

  const fetchUserGroups = async () => {
    try {
  const res = await apiFetch(`/api/groups/user/${userId}`);
  const data = await res.json();
      setGroups(data.groups);
    } catch (err) {
      setError('Failed to fetch groups');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName || !newGroupPasscode) {
      setError('Group name and passcode are required');
      return;
    }

    try {
      const res = await apiFetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          adminId: userId,
          passcode: newGroupPasscode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create group');
        return;
      }

      setSuccess('Group created successfully!');
      setNewGroupName('');
      setNewGroupPasscode('');
      fetchUserGroups();
      // auto-select the created group for convenience
      if (data.group) {
        setUser(prev => ({ ...prev, currentGroupId: data.group.id, currentGroupRole: 'admin' }));
        navigate && navigate('group-tasks');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinGroupId || !joinPasscode) {
      setError('Group ID and passcode are required');
      return;
    }

    try {
      const res = await apiFetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: Number(joinGroupId),
          userId,
          passcode: joinPasscode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join group');
        return;
      }

      setSuccess('Joined group successfully!');
      setJoinGroupId('');
      setJoinPasscode('');
      fetchUserGroups();
      if (data.group) {
        setUser(prev => ({ ...prev, currentGroupId: data.group.id, currentGroupRole: 'member' }));
        navigate && navigate('group-tasks');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="group-management">
      <h2>Group Management</h2>
      
      {/* Create Group Form */}
      <div className="create-group">
        <h3>Create New Group</h3>
        <form onSubmit={handleCreateGroup}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          <div className="form-group">
            <label>Group Passcode</label>
            <input
              type="text"
              value={newGroupPasscode}
              onChange={(e) => setNewGroupPasscode(e.target.value)}
              placeholder="Enter group passcode"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Create Group</button>
        </form>
      </div>

      {/* Join Group Form */}
      <div className="join-group">
        <h3>Join Existing Group</h3>
        <form onSubmit={handleJoinGroup}>
          <div className="form-group">
            <label>Group ID</label>
            <input
              type="number"
              value={joinGroupId}
              onChange={(e) => setJoinGroupId(e.target.value)}
              placeholder="Enter group ID"
              required
            />
          </div>
          <div className="form-group">
            <label>Group Passcode</label>
            <input
              type="text"
              value={joinPasscode}
              onChange={(e) => setJoinPasscode(e.target.value)}
              placeholder="Enter group passcode"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Join Group</button>
        </form>
      </div>

      {/* Error and Success Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Groups List */}
      <div className="groups-list">
        <h3>My Groups</h3>
        {groups.length === 0 ? (
          <p>You're not a member of any groups yet.</p>
        ) : (
          <ul>
            {groups.map(group => (
              <li key={group.id}>
                <h4>{group.name}</h4>
                <p>Group ID: {group.id}</p>
                <p>Members: {group.members.length}</p>
                {group.adminId === userId && <span className="admin-badge">Admin</span>}
                <div style={{marginTop:8}}>
                  <button className="btn" onClick={() => {
                    setUser(prev => ({ ...prev, currentGroupId: group.id, currentGroupRole: group.adminId === userId ? 'admin' : 'member' }));
                    navigate && navigate('group-tasks');
                  }}>Open Group</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}