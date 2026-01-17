import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dependenciesApi } from '@/lib/api';
import type { TaskDependency, DependencyCreator } from 'shared/types';

const DEPENDENCIES_QUERY_KEY = 'task-dependencies';

export function useTaskDependencies(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: dependencies = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TaskDependency[]>({
    queryKey: [DEPENDENCIES_QUERY_KEY, projectId],
    queryFn: () => dependenciesApi.getByProject(projectId!),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      task_id: string;
      depends_on_task_id: string;
      created_by?: DependencyCreator;
    }) => dependenciesApi.create(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DEPENDENCIES_QUERY_KEY, projectId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dependencyId: string) => dependenciesApi.delete(dependencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DEPENDENCIES_QUERY_KEY, projectId],
      });
    },
  });

  return {
    dependencies,
    isLoading,
    error,
    refetch,
    createDependency: createMutation.mutateAsync,
    deleteDependency: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
