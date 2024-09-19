'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Machine, QueueItem, TimerNotification, BaseTimerNotification } from '@/types';
import { withRoleAccess } from '@/components/withRoleAccess';
import { api } from '@/services/api';
import Modal from '@/components/Modal';

function DashboardPage() {
  const { user, setUser, logout } = useUser();
  const [machines, setMachines] = useState<Record<string, Machine>>({});
  const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
  const [gymId, setGymId] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const floorPlanRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [queueCountdown, setQueueCountdown] = useState<TimerNotification | null>(null);
  const [machineTagOffCountdown, setMachineTagOffCountdown] = useState<TimerNotification | null>(null);
  const [gymSessionEndingCountdown, setGymSessionEndingCountdown] = useState<BaseTimerNotification | null>(null);

  const selectedMachine = selectedMachineId ? machines[selectedMachineId] : null;

  // Connect to WebSocket if user is in a gym
  useEffect(() => {
    if (user && user.gymId) {
      connectWebSocket();
    } else if (user && !user.gymId) {
      setQueueCountdown(null);
      setMachineTagOffCountdown(null);
      setGymSessionEndingCountdown(null);
      setMachines({});
      handleCloseModal();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.gymId]);

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:3000');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      const wsToken = localStorage.getItem('wsToken');
      if (wsToken) {
        wsRef.current?.send(JSON.stringify({
          type: 'authenticate',
          token: wsToken,
          gymId: user?.gymId,
          queuedMachineId: user?.queueItem?.machineId
        }));
      } else {
        console.error('No WebSocket token found');
      }
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'machineStatus':
          for (const machine of message.data) {
            setMachines(prevMachines => ({
              ...prevMachines,
              [machine.id]: machine
            }));
          }
          break;
        case 'machineUpdate':
          if (message.data) {
            setMachines(prevMachines => ({
              ...prevMachines,
              [message.machineId]: {
                ...prevMachines[message.machineId],
                ...message.data
              }
            }));
          } else {
            setMachines(({ [message.machineId]: _, ...rest }) => rest);
          }
          break;
        case 'userUpdate':
          setUser(user ? {...user, ...message.data} : null);
          break;
        case 'queueUpdate':
          setQueueItem(message.data);
          break;
        case 'timerNotification':
          switch (message.data.type) {
            case 'queueCountdown':
              setQueueCountdown(message.data);
              break;
            case 'machineTagOff':
              setMachineTagOffCountdown(message.data);
              break;
            case 'gymSessionEnding':
              setGymSessionEndingCountdown(message.data);
              break;
          }
          break;
        default:
          console.error('Unknown message type:', message.type);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const handleGymIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.toggleGymSession(gymId);

      // Update user to trigger websocket connection
      setUser(user ? {...user, gymId} : null);
      setGymId('');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      await api.toggleGymSession(user?.gymId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMachineClick = (machine: Machine, event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedMachineId === machine.id && isModalOpen) {
      handleCloseModal();
    } else {
      if (floorPlanRef.current) {
        const x = event.clientX;
        const y = event.clientY;
        setModalPosition({ x, y });
      }
      setSelectedMachineId(machine.id);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMachineId(null);
  };

  const handleTagOn = async (machineId: string) => {
    try {
      await api.tagOn(machineId);
    } catch (error) {
      console.error('Error tagging on to machine:', error);
    }
  };

  const handleTagOff = async (machineId: string) => {
    try {
      await api.tagOff(machineId);
    } catch (error) {
      console.error('Error tagging off from machine:', error);
    }
  };

  const handleEnqueue = async (machineId: string) => {
    try {
      await api.enqueue(machineId);
    } catch (error) {
      console.error('Error enqueuing:', error);
    }
  }

  const handleRemoveFromQueue = async () => {
    try {
      await api.dequeue();
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }

  const getMachineButtonClass = (machine: Machine) => {
    const baseClasses = "absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold";
    const activeClass = "bg-red-600 hover:bg-red-700";
    const inactiveClass = "bg-green-600 hover:bg-green-700";
    
    return `${baseClasses} ${machine.currentWorkoutLogId ? activeClass : inactiveClass}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-300 mr-4">Welcome, {user.name}!</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!user.gymId ? (
            <form onSubmit={handleGymIdSubmit} className="mb-8">
              <input
                type="text"
                value={gymId}
                onChange={(e) => setGymId(e.target.value)}
                placeholder="Enter Gym ID"
                className="bg-gray-700 border border-gray-600 p-2 mr-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
                Start Session
              </button>
            </form>
          ) : (
            <div className="mb-8">
              <p className="text-lg font-semibold mb-2">Active Session: {user.gymId}</p>
              <button 
                onClick={handleEndSession} 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                End Session
              </button>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Gym Floor Plan</h2>
          <div 
            ref={floorPlanRef}
            className="relative w-full h-[600px] bg-gray-800 border border-gray-700 rounded-lg"
          >
            {Object.values(machines).map((machine) => (
              <button
                key={machine.id}
                onClick={(e) => handleMachineClick(machine, e)}
                className={getMachineButtonClass(machine)}
                style={{
                  left: `${machine.location[1]}%`,
                  top: `${machine.location[2]}%`,
                }}
              >
                {machine.name[0]}
              </button>
            ))}
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        x={modalPosition.x}
        y={modalPosition.y}
      >
        {selectedMachine && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedMachine.name}</h3>
            <p>Floor: {selectedMachine.location[0]}</p>
            <p>Position: ({selectedMachine.location[1]}, {selectedMachine.location[2]})</p>
            <p>Status: {selectedMachine.currentWorkoutLogId ? 'Active' : 'Inactive'}</p>
            
            {user.currentWorkoutLogId && user.currentWorkoutLogId === selectedMachine.currentWorkoutLogId ? (
              <button
                onClick={() => handleTagOff(selectedMachine.id)}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Tag Off
              </button>
            ) : (
              <button
                onClick={() => handleTagOn(selectedMachine.id)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Tag On
              </button>
            )}
            
            {queueItem && queueItem.machineId === selectedMachine.id ? (
              <p className="mt-2 text-yellow-400">Your position in queue: {queueItem.position}</p>
            ) : (
              <p className="mt-2 text-yellow-400">Queue size: {selectedMachine.queueSize} / {selectedMachine.maximumQueueSize}</p> 
            )}
            
            {(selectedMachine.currentWorkoutLogId || selectedMachine.queueSize > 0) &&
            (!user.currentWorkoutLogId || user.currentWorkoutLogId !== selectedMachine.currentWorkoutLogId) ? (
              queueItem === null ? (
                <button
                  onClick={() => handleEnqueue(selectedMachine.id)}
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Enqueue
                </button>
              ) : queueItem.machineId === selectedMachine.id && (
                <button
                  onClick={() => handleRemoveFromQueue()}
                  className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Remove from Queue
                </button>
              )
            ) : null}
          </div>
        )}
      </Modal>

      {queueCountdown && queueCountdown.remainingTime > 0 && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-4 rounded shadow-lg">
          {queueCountdown.message}
          <button
            onClick={() => handleTagOn(queueCountdown.machineId)}
            className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tag On Now
          </button>
        </div>
      )}

      {machineTagOffCountdown && machineTagOffCountdown.remainingTime > 0 && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded shadow-lg">
          {machineTagOffCountdown.message}
        </div>
      )}

      {gymSessionEndingCountdown && gymSessionEndingCountdown.remainingTime > 0 && (
        <div className="fixed top-4 right-4 bg-orange-500 text-white p-4 rounded shadow-lg">
          {gymSessionEndingCountdown.message}
        </div>
      )}
    </div>
  );
}

export default withRoleAccess(DashboardPage, ['user']);