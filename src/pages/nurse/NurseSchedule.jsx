import { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TaskList = styled.div`
  display: grid;
  gap: 16px;
`;

const TaskCard = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
`;

const TaskContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const TaskMeta = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
`;

const NurseSchedule = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    const nextTask = {
      id: Date.now(),
      title: newTask.trim(),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [nextTask, ...prev]);
    setNewTask('');
    toast.success('Task added');
  };

  const handleRemoveTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast.success('Task removed');
  };

  return (
    <PageContainer>
      <Header>
        <h1>My Tasks</h1>
        <p>
          Add personal reminders or follow-ups — this is separate from doctor appointments.
        </p>
      </Header>

      <Card size="large">
        <CardBody>
          <TaskHeader>
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task or reminder..."
            />
            <Button
              variant="primary"
              onClick={handleAddTask}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusIcon style={{ width: '18px', height: '18px' }} />
              Add
            </Button>
          </TaskHeader>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No tasks yet</h3>
              <p style={{ fontSize: '14px' }}>
                Create a reminder or note for your workday.
              </p>
            </div>
          ) : (
            <TaskList>
              {tasks.map((task) => (
                <TaskCard key={task.id}>
                  <TaskContent>
                    <TaskTitle>{task.title}</TaskTitle>
                    <TaskMeta>Added on {new Date(task.createdAt).toLocaleString()}</TaskMeta>
                  </TaskContent>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => handleRemoveTask(task.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <TrashIcon style={{ width: '16px', height: '16px' }} />
                    Remove
                  </Button>
                </TaskCard>
              ))}
            </TaskList>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default NurseSchedule;
