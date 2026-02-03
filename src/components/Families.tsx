import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Home,
  UserPlus,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Edit2,
  X,
} from 'lucide-react';
import type { Person } from '../types';

interface Family {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  memberIds: string[];
  headOfHousehold?: string;
  createdAt: string;
}

interface FamiliesProps {
  people: Person[];
  onViewPerson?: (personId: string) => void;
}

// Generate families from people data based on shared last names and addresses
function generateFamiliesFromPeople(people: Person[]): Family[] {
  const familyMap = new Map<string, Person[]>();

  people.forEach(person => {
    // Group by last name + address (if available)
    const key = person.lastName + (person.address || '');
    if (!familyMap.has(key)) {
      familyMap.set(key, []);
    }
    familyMap.get(key)!.push(person);
  });

  const families: Family[] = [];
  let id = 1;

  familyMap.forEach((members) => {
    if (members.length > 0) {
      const primaryMember = members[0];
      families.push({
        id: String(id++),
        name: `${primaryMember.lastName} Family`,
        address: primaryMember.address,
        phone: primaryMember.phone,
        email: primaryMember.email,
        memberIds: members.map(m => m.id),
        headOfHousehold: primaryMember.id,
        createdAt: new Date().toISOString(),
      });
    }
  });

  return families.sort((a, b) => a.name.localeCompare(b.name));
}

export function Families({ people, onViewPerson }: FamiliesProps) {
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const families = useMemo(() => generateFamiliesFromPeople(people), [people]);

  const filteredFamilies = useMemo(() => {
    if (!search) return families;
    const searchLower = search.toLowerCase();
    return families.filter(f =>
      f.name.toLowerCase().includes(searchLower) ||
      f.address?.toLowerCase().includes(searchLower)
    );
  }, [families, search]);

  const getFamilyMembers = (family: Family) => {
    return people.filter(p => family.memberIds.includes(p.id));
  };

  if (selectedFamily) {
    const members = getFamilyMembers(selectedFamily);
    return (
      <div className="p-8">
        <button
          onClick={() => setSelectedFamily(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-dark-300 mb-6"
        >
          <ChevronRight className="rotate-180" size={16} />
          Back to Families
        </button>

        <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <Home className="text-indigo-600 dark:text-indigo-400" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">{selectedFamily.name}</h1>
                <p className="text-gray-500 dark:text-dark-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg">
                <Edit2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            {selectedFamily.address && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
                <MapPin size={16} className="text-gray-400" />
                {selectedFamily.address}
              </div>
            )}
            {selectedFamily.phone && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
                <Phone size={16} className="text-gray-400" />
                {selectedFamily.phone}
              </div>
            )}
            {selectedFamily.email && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
                <Mail size={16} className="text-gray-400" />
                {selectedFamily.email}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-dark-100">Family Members</h2>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
              <UserPlus size={16} />
              Add Member
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {members.map(member => (
              <div
                key={member.id}
                onClick={() => onViewPerson?.(member.id)}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-dark-100">
                    {member.firstName} {member.lastName}
                    {member.id === selectedFamily.headOfHousehold && (
                      <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        Head of Household
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">{member.email}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">Families</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            Manage family units and households
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Family
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
          <Home className="text-indigo-500 mb-2" size={20} />
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{families.length}</p>
          <p className="text-sm text-gray-500 dark:text-dark-400">Total Families</p>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
          <Users className="text-green-500 mb-2" size={20} />
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{people.length}</p>
          <p className="text-sm text-gray-500 dark:text-dark-400">Total Members</p>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
          <Users className="text-amber-500 mb-2" size={20} />
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
            {families.length > 0 ? (people.length / families.length).toFixed(1) : 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-400">Avg. Family Size</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search families..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Families List */}
      <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="font-semibold text-gray-900 dark:text-dark-100">
            All Families ({filteredFamilies.length})
          </h2>
        </div>

        {filteredFamilies.length === 0 ? (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
            <p className="text-gray-500 dark:text-dark-400">No families found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {filteredFamilies.map(family => {
              const members = getFamilyMembers(family);
              return (
                <div
                  key={family.id}
                  onClick={() => setSelectedFamily(family)}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <Home className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-dark-100">{family.name}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-400 truncate">
                      {members.length} member{members.length !== 1 ? 's' : ''}
                      {family.address && ` • ${family.address}`}
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {members.slice(0, 4).map(member => (
                      <div
                        key={member.id}
                        className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-dark-850"
                        title={`${member.firstName} ${member.lastName}`}
                      >
                        {member.firstName[0]}
                      </div>
                    ))}
                    {members.length > 4 && (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-dark-300 border-2 border-white dark:border-dark-850">
                        +{members.length - 4}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Family Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Add Family</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-400 mb-4">
              Families are automatically created from people with matching last names.
              To create a new family, add people with the same last name.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
