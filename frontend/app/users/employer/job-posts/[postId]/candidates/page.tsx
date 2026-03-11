import FilterBar from "@/components/employer/candidates/FilterBar";
import CandidateCard from "@/components/employer/candidates/CandidateCard";

interface Props {
  params: { postId: string };
}

export default function PostCandidatesPage({ params }: Props) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Candidates for Post — {params.postId}</h1>
      <FilterBar />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* CandidateCard items rendered here */}
      </div>
    </div>
  );
}
