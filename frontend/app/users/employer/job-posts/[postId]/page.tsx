import JobPostForm from "@/components/employer/job-posts/JobPostForm";

interface Props {
  params: { postId: string };
}

export default function JobPostDetailPage({ params }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Job Post — {params.postId}</h1>
      <JobPostForm postId={params.postId} />
    </div>
  );
}
