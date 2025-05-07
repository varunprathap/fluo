import { useRouter } from 'next/navigation';

const MembersPage = () => {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Members</h1>
      {/* Add members content here */}
    </div>
  );
};

export default MembersPage; 