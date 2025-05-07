import { useRouter } from 'next/navigation';

const GroupsPage = () => {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Groups</h1>
      {/* Add groups content here */}
    </div>
  );
};

export default GroupsPage; 