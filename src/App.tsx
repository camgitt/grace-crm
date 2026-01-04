import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PeopleList } from './components/PeopleList';
import { PersonProfile } from './components/PersonProfile';
import { PersonForm } from './components/PersonForm';
import { Tasks } from './components/Tasks';
import { Calendar } from './components/Calendar';
import { Groups } from './components/Groups';
import { Prayer } from './components/Prayer';
import { Giving } from './components/Giving';
import { Settings } from './components/Settings';
import { GlobalSearch } from './components/GlobalSearch';
import { ComposeMessage } from './components/ComposeMessage';
import { Login } from './components/Login';
import { useAuth } from './lib/AuthContext';
import { useDatabase } from './lib/useDatabase';
import { sendEmail, sendSms } from './lib/emailService';
import {
  View,
  Person,
  Task,
  Interaction,
  CalendarEvent,
  Giving as GivingType,
  Communication
} from './types';
import { SAMPLE_EVENTS, SAMPLE_GIVING } from './constants';

function App() {
  const { user, loading: authLoading, isConfigured: authConfigured } = useAuth();
  const {
    people,
    tasks,
    interactions,
    groups,
    prayers,
    loading: dbLoading,
    addPerson,
    updatePerson,
    addTask,
    toggleTask,
    addInteraction,
    markPrayerAnswered,
    addCommunication
  } = useDatabase();

  const [view, setView] = useState<View>('dashboard');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Static data (would also come from database in full production)
  const [events] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [giving] = useState<GivingType[]>(SAMPLE_GIVING);

  // Modal states
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipients, setComposeRecipients] = useState<Person[]>([]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if auth is configured but user not logged in
  if (authConfigured && !user) {
    return <Login />;
  }

  const handleViewPerson = (id: string) => {
    setSelectedPersonId(id);
    setView('person');
  };

  const handleBackToPeople = () => {
    setSelectedPersonId(null);
    setView('people');
  };

  const handleAddInteraction = async (interaction: Omit<Interaction, 'id' | 'createdAt'>) => {
    await addInteraction(interaction);
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    await addTask(task);
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const handleMarkPrayerAnswered = async (id: string, testimony?: string) => {
    await markPrayerAnswered(id, testimony);
  };

  // Person CRUD handlers
  const handleAddPerson = () => {
    setEditingPerson(undefined);
    setShowPersonForm(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setShowPersonForm(true);
  };

  const handleSavePerson = async (personData: Omit<Person, 'id'> | Person) => {
    try {
      if ('id' in personData) {
        await updatePerson(personData);
      } else {
        await addPerson(personData);
      }
      setShowPersonForm(false);
      setEditingPerson(undefined);
    } catch (error) {
      console.error('Failed to save person:', error);
    }
  };

  // Search handlers
  const handleSearchSelectPerson = (id: string) => {
    handleViewPerson(id);
  };

  // Communication handlers
  const handleOpenCompose = (recipients: Person[]) => {
    setComposeRecipients(recipients);
    setShowCompose(true);
  };

  const handleSendCommunications = async (comms: Omit<Communication, 'id' | 'sentAt'>[]) => {
    for (const comm of comms) {
      const person = people.find(p => p.id === comm.personId);
      if (!person) continue;

      // Actually send the email/SMS
      if (comm.type === 'email') {
        await sendEmail({
          to: person.email,
          subject: comm.subject || 'Message from Grace Community',
          html: comm.content.replace(/\n/g, '<br>')
        });
      } else {
        await sendSms({
          to: person.phone,
          message: comm.content
        });
      }

      // Log the communication
      await addCommunication(comm);
    }
  };

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  const renderView = () => {
    if (dbLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            people={people}
            tasks={tasks}
            onViewPerson={handleViewPerson}
            onViewTasks={() => setView('tasks')}
          />
        );

      case 'people':
        return (
          <PeopleList
            people={people}
            onViewPerson={handleViewPerson}
            onAddPerson={handleAddPerson}
            onSendMessage={handleOpenCompose}
          />
        );

      case 'person':
        if (!selectedPerson) {
          setView('people');
          return null;
        }
        return (
          <PersonProfile
            person={selectedPerson}
            interactions={interactions}
            tasks={tasks}
            onBack={handleBackToPeople}
            onAddInteraction={handleAddInteraction}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onEditPerson={handleEditPerson}
            onSendMessage={() => handleOpenCompose([selectedPerson])}
          />
        );

      case 'tasks':
        return (
          <Tasks
            tasks={tasks}
            people={people}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        );

      case 'calendar':
        return <Calendar events={events} />;

      case 'groups':
        return <Groups groups={groups} people={people} />;

      case 'prayer':
        return (
          <Prayer
            prayers={prayers}
            people={people}
            onMarkAnswered={handleMarkPrayerAnswered}
          />
        );

      case 'giving':
        return <Giving giving={giving} people={people} />;

      case 'settings':
        return <Settings />;

      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        currentView={view}
        setView={setView}
        onOpenSearch={() => setShowSearch(true)}
      >
        {renderView()}
      </Layout>

      {/* Person Form Modal */}
      {showPersonForm && (
        <PersonForm
          person={editingPerson}
          onSave={handleSavePerson}
          onClose={() => {
            setShowPersonForm(false);
            setEditingPerson(undefined);
          }}
        />
      )}

      {/* Global Search Modal */}
      {showSearch && (
        <GlobalSearch
          people={people}
          tasks={tasks}
          prayers={prayers}
          onSelectPerson={handleSearchSelectPerson}
          onSelectTask={() => setView('tasks')}
          onSelectPrayer={() => setView('prayer')}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Compose Message Modal */}
      {showCompose && composeRecipients.length > 0 && (
        <ComposeMessage
          recipients={composeRecipients}
          onClose={() => {
            setShowCompose(false);
            setComposeRecipients([]);
          }}
          onSend={handleSendCommunications}
        />
      )}
    </>
  );
}

export default App;
