import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuth } from './AuthContext';
import {
  Person,
  Task,
  Interaction,
  SmallGroup,
  PrayerRequest,
  Communication
} from '../types';
import {
  SAMPLE_PEOPLE,
  SAMPLE_TASKS,
  SAMPLE_INTERACTIONS,
  SAMPLE_GROUPS,
  SAMPLE_PRAYERS
} from '../constants';

// Transform database rows to app types
function transformPerson(row: any): Person {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    photo: row.photo,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    birthDate: row.birth_date,
    joinDate: row.join_date,
    firstVisit: row.first_visit,
    notes: row.notes,
    tags: row.tags || [],
    smallGroups: row.small_groups || [],
    familyId: row.family_id
  };
}

function transformTask(row: any): Task {
  return {
    id: row.id,
    personId: row.person_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    completed: row.completed,
    priority: row.priority,
    assignedTo: row.assigned_to,
    category: row.category,
    createdAt: row.created_at
  };
}

function transformInteraction(row: any): Interaction {
  return {
    id: row.id,
    personId: row.person_id,
    type: row.type,
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by
  };
}

function transformGroup(row: any): SmallGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    leaderId: row.leader_id,
    meetingDay: row.meeting_day,
    meetingTime: row.meeting_time,
    location: row.location,
    members: row.members || [],
    isActive: row.is_active
  };
}

function transformPrayer(row: any): PrayerRequest {
  return {
    id: row.id,
    personId: row.person_id,
    content: row.content,
    isPrivate: row.is_private,
    isAnswered: row.is_answered,
    testimony: row.testimony,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function useDatabase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State
  const [people, setPeople] = useState<Person[]>(SAMPLE_PEOPLE);
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [interactions, setInteractions] = useState<Interaction[]>(SAMPLE_INTERACTIONS);
  const [groups, setGroups] = useState<SmallGroup[]>(SAMPLE_GROUPS);
  const [prayers, setPrayers] = useState<PrayerRequest[]>(SAMPLE_PRAYERS);
  const [communications, setCommunications] = useState<Communication[]>([]);

  const isConfigured = isSupabaseConfigured();

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        { data: peopleData, error: peopleError },
        { data: tasksData, error: tasksError },
        { data: interactionsData, error: interactionsError },
        { data: groupsData, error: groupsError },
        { data: prayersData, error: prayersError },
        { data: commsData, error: commsError }
      ] = await Promise.all([
        supabase.from('people').select('*').order('last_name'),
        supabase.from('tasks').select('*').order('due_date'),
        supabase.from('interactions').select('*').order('created_at', { ascending: false }),
        supabase.from('small_groups').select('*').order('name'),
        supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('communications').select('*').order('sent_at', { ascending: false })
      ]);

      if (peopleError) throw peopleError;
      if (tasksError) throw tasksError;
      if (interactionsError) throw interactionsError;
      if (groupsError) throw groupsError;
      if (prayersError) throw prayersError;
      if (commsError) throw commsError;

      setPeople((peopleData || []).map(transformPerson));
      setTasks((tasksData || []).map(transformTask));
      setInteractions((interactionsData || []).map(transformInteraction));
      setGroups((groupsData || []).map(transformGroup));
      setPrayers((prayersData || []).map(transformPrayer));
      setCommunications(commsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD operations
  const addPerson = async (person: Omit<Person, 'id'>) => {
    if (!supabase) {
      // Demo mode - add locally
      const newPerson = { ...person, id: Date.now().toString() };
      setPeople([...people, newPerson]);
      return newPerson;
    }

    const { data, error } = await supabase
      .from('people')
      .insert({
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        phone: person.phone,
        status: person.status,
        photo: person.photo || null,
        address: person.address || null,
        city: person.city || null,
        state: person.state || null,
        zip: person.zip || null,
        birth_date: person.birthDate || null,
        join_date: person.joinDate || null,
        first_visit: person.firstVisit || null,
        notes: person.notes || null,
        tags: person.tags,
        small_groups: person.smallGroups,
        family_id: person.familyId || null
      } as any)
      .select()
      .single();

    if (error) throw error;
    const newPerson = transformPerson(data);
    setPeople([...people, newPerson]);
    return newPerson;
  };

  const updatePerson = async (person: Person) => {
    if (!supabase) {
      setPeople(people.map(p => p.id === person.id ? person : p));
      return person;
    }

    const { error } = await supabase
      .from('people')
      .update({
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        phone: person.phone,
        status: person.status,
        photo: person.photo || null,
        address: person.address || null,
        city: person.city || null,
        state: person.state || null,
        zip: person.zip || null,
        birth_date: person.birthDate || null,
        join_date: person.joinDate || null,
        first_visit: person.firstVisit || null,
        notes: person.notes || null,
        tags: person.tags,
        small_groups: person.smallGroups,
        family_id: person.familyId || null
      } as any)
      .eq('id', person.id);

    if (error) throw error;
    setPeople(people.map(p => p.id === person.id ? person : p));
    return person;
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!supabase) {
      const newTask = { ...task, id: Date.now().toString(), createdAt: new Date().toISOString() };
      setTasks([...tasks, newTask]);
      return newTask;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        person_id: task.personId || null,
        title: task.title,
        description: task.description || null,
        due_date: task.dueDate,
        completed: task.completed,
        priority: task.priority,
        assigned_to: task.assignedTo || null,
        category: task.category
      } as any)
      .select()
      .single();

    if (error) throw error;
    const newTask = transformTask(data);
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    if (!supabase) {
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .update({ completed: updatedTask.completed } as any)
      .eq('id', taskId);

    if (error) throw error;
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };

  const addInteraction = async (interaction: Omit<Interaction, 'id' | 'createdAt'>) => {
    if (!supabase) {
      const newInteraction = {
        ...interaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setInteractions([newInteraction, ...interactions]);
      return newInteraction;
    }

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        person_id: interaction.personId,
        type: interaction.type,
        content: interaction.content,
        created_by: interaction.createdBy
      } as any)
      .select()
      .single();

    if (error) throw error;
    const newInteraction = transformInteraction(data);
    setInteractions([newInteraction, ...interactions]);
    return newInteraction;
  };

  const markPrayerAnswered = async (id: string, testimony?: string) => {
    if (!supabase) {
      setPrayers(prayers.map(p =>
        p.id === id
          ? { ...p, isAnswered: true, testimony, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      ));
      return;
    }

    const { error } = await supabase
      .from('prayer_requests')
      .update({
        is_answered: true,
        testimony: testimony || null,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id);

    if (error) throw error;
    setPrayers(prayers.map(p =>
      p.id === id
        ? { ...p, isAnswered: true, testimony, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
  };

  const addCommunication = async (comm: Omit<Communication, 'id' | 'sentAt'>) => {
    const newComm: Communication = {
      ...comm,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sentAt: new Date().toISOString()
    };

    if (!supabase) {
      setCommunications([newComm, ...communications]);
      // Also add as interaction
      await addInteraction({
        personId: comm.personId,
        type: comm.type === 'email' ? 'email' : 'text',
        content: comm.type === 'email'
          ? `Email sent: "${comm.subject}" - ${comm.content.substring(0, 100)}...`
          : `Text sent: ${comm.content}`,
        createdBy: comm.sentBy
      });
      return newComm;
    }

    const { data, error } = await supabase
      .from('communications')
      .insert({
        person_id: comm.personId,
        type: comm.type,
        subject: comm.subject || null,
        content: comm.content,
        template_used: comm.templateUsed || null,
        sent_by: comm.sentBy,
        status: comm.status
      } as any)
      .select()
      .single();

    if (error) throw error;
    setCommunications([data, ...communications]);

    // Also add as interaction
    await addInteraction({
      personId: comm.personId,
      type: comm.type === 'email' ? 'email' : 'text',
      content: comm.type === 'email'
        ? `Email sent: "${comm.subject}" - ${comm.content.substring(0, 100)}...`
        : `Text sent: ${comm.content}`,
      createdBy: comm.sentBy
    });

    return data;
  };

  return {
    // Data
    people,
    tasks,
    interactions,
    groups,
    prayers,
    communications,

    // State
    loading,
    error,
    isConfigured,

    // Actions
    setPeople,
    setTasks,
    setInteractions,
    setPrayers,
    setCommunications,
    addPerson,
    updatePerson,
    addTask,
    toggleTask,
    addInteraction,
    markPrayerAnswered,
    addCommunication,
    refetch: fetchData
  };
}
