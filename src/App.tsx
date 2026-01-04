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
import {
  View,
  Person,
  Task,
  Interaction,
  SmallGroup,
  PrayerRequest,
  CalendarEvent,
  Giving as GivingType,
  Communication
} from './types';
import {
  SAMPLE_PEOPLE,
  SAMPLE_TASKS,
  SAMPLE_GROUPS,
  SAMPLE_PRAYERS,
  SAMPLE_INTERACTIONS,
  SAMPLE_EVENTS,
  SAMPLE_GIVING
} from './constants';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // State with sample data
  const [people, setPeople] = useState<Person[]>(SAMPLE_PEOPLE);
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [interactions, setInteractions] = useState<Interaction[]>(SAMPLE_INTERACTIONS);
  const [groups] = useState<SmallGroup[]>(SAMPLE_GROUPS);
  const [prayers, setPrayers] = useState<PrayerRequest[]>(SAMPLE_PRAYERS);
  const [events] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [giving] = useState<GivingType[]>(SAMPLE_GIVING);

  // Communications state
  const [communications, setCommunications] = useState<Communication[]>([]);

  // Modal states
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipients, setComposeRecipients] = useState<Person[]>([]);

  const handleViewPerson = (id: string) => {
    setSelectedPersonId(id);
    setView('person');
  };

  const handleBackToPeople = () => {
    setSelectedPersonId(null);
    setView('people');
  };

  const handleAddInteraction = (interaction: Omit<Interaction, 'id' | 'createdAt'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setInteractions([...interactions, newInteraction]);
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleMarkPrayerAnswered = (id: string, testimony?: string) => {
    setPrayers(prayers.map(p =>
      p.id === id
        ? { ...p, isAnswered: true, testimony, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
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

  const handleSavePerson = (personData: Omit<Person, 'id'> | Person) => {
    if ('id' in personData) {
      // Editing existing person
      setPeople(people.map(p => p.id === personData.id ? personData : p));
    } else {
      // Adding new person
      const newPerson: Person = {
        ...personData,
        id: Date.now().toString()
      };
      setPeople([...people, newPerson]);
    }
    setShowPersonForm(false);
    setEditingPerson(undefined);
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

  const handleSendCommunications = (comms: Omit<Communication, 'id' | 'sentAt'>[]) => {
    const newCommunications: Communication[] = comms.map(comm => ({
      ...comm,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sentAt: new Date().toISOString()
    }));
    setCommunications([...communications, ...newCommunications]);

    // Also add as interactions for history
    const newInteractions: Interaction[] = newCommunications.map(comm => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      personId: comm.personId,
      type: comm.type === 'email' ? 'email' as const : 'text' as const,
      content: comm.type === 'email'
        ? `Email sent: "${comm.subject}" - ${comm.content.substring(0, 100)}...`
        : `Text sent: ${comm.content}`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: comm.sentBy
    }));
    setInteractions([...interactions, ...newInteractions]);
  };

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  const renderView = () => {
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
