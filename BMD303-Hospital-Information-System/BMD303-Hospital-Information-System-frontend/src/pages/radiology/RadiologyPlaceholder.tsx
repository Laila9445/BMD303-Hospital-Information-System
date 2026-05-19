import Sidebar from '../../components/radiology/Sidebar';

type Props = { title: string };

export default function RadiologyPlaceholder({ title }: Props) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-gray-800 text-2xl font-bold">{title}</h1>
        <p className="text-gray-500 mt-2">This section is not in the merged Radiology-front bundle yet.</p>
      </div>
    </div>
  );
}
