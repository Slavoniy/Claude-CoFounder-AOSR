import { ProjectDetailContent } from './ProjectDetailContent';

export default function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ProjectDetailContent projectId={params.projectId} />;
}
