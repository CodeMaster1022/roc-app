import { useState, useEffect, useCallback, useRef } from 'react';
import { applicationService, type ApplicationDraft } from '@/services/applicationService';
import { useToast } from '@/hooks/use-toast';

interface UseApplicationProgressProps {
  propertyId: string;
  isOpen: boolean;
  onProgressLoaded?: (draft: ApplicationDraft) => void;
}

interface UseApplicationProgressReturn {
  // State
  isLoading: boolean;
  isSaving: boolean;
  hasProgress: boolean;
  currentStep: number;
  completedSteps: number[];
  lastSavedAt: Date | null;
  
  // Actions
  saveProgress: (step: number, completedSteps: number[], data: any) => Promise<void>;
  loadProgress: () => Promise<void>;
  deleteProgress: () => Promise<void>;
  submitDraft: () => Promise<void>;
}

export const useApplicationProgress = ({
  propertyId,
  isOpen,
  onProgressLoaded
}: UseApplicationProgressProps): UseApplicationProgressReturn => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // Debounce timer for auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<any>(null);

  // Load progress when modal opens
  useEffect(() => {
    if (isOpen && propertyId) {
      loadProgress();
    }
  }, [isOpen, propertyId]);

  // Auto-save with debouncing
  const debouncedSave = useCallback((step: number, completedSteps: number[], data: any) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Store the latest data
    lastSaveDataRef.current = { step, completedSteps, data };

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      if (lastSaveDataRef.current) {
        await saveProgress(
          lastSaveDataRef.current.step,
          lastSaveDataRef.current.completedSteps,
          lastSaveDataRef.current.data
        );
      }
    }, 2000); // 2 second debounce
  }, []);

  const saveProgress = useCallback(async (step: number, completedSteps: number[], data: any) => {
    if (!propertyId) return;

    setIsSaving(true);
    try {
      const response = await applicationService.saveApplicationProgress(
        propertyId,
        step,
        completedSteps,
        data
      );

      setHasProgress(true);
      setCurrentStep(response.data.draft.currentStep);
      setCompletedSteps(response.data.draft.completedSteps);
      setLastSavedAt(new Date(response.data.draft.lastSavedAt));

      // Show subtle success indicator (not intrusive)
      console.log('✅ Progress saved automatically');
    } catch (error: any) {
      console.error('Failed to save progress:', error);
      // Don't show error toast for auto-save failures to avoid interrupting user
    } finally {
      setIsSaving(false);
    }
  }, [propertyId]);

  const loadProgress = useCallback(async () => {
    if (!propertyId) return;

    setIsLoading(true);
    try {
      const response = await applicationService.getApplicationProgress(propertyId);
      const draft = response.data.draft;

      setHasProgress(true);
      setCurrentStep(draft.currentStep);
      setCompletedSteps(draft.completedSteps);
      setLastSavedAt(new Date(draft.lastSavedAt));

      // Call the callback to load the data into the form
      if (onProgressLoaded) {
        onProgressLoaded(draft);
      }

      toast({
        title: "Progress Restored",
        description: `Resuming from step ${draft.currentStep}. Your previous progress has been loaded.`,
      });
    } catch (error: any) {
      // No progress found - this is normal for new applications
      setHasProgress(false);
      setCurrentStep(1);
      setCompletedSteps([]);
      setLastSavedAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, onProgressLoaded, toast]);

  const deleteProgress = useCallback(async () => {
    if (!propertyId) return;

    try {
      await applicationService.deleteApplicationProgress(propertyId);
      setHasProgress(false);
      setCurrentStep(1);
      setCompletedSteps([]);
      setLastSavedAt(null);
    } catch (error: any) {
      console.error('Failed to delete progress:', error);
      toast({
        title: "Error",
        description: "Failed to delete saved progress",
        variant: "destructive"
      });
    }
  }, [propertyId, toast]);

  const submitDraft = useCallback(async () => {
    if (!propertyId) return;

    try {
      await applicationService.submitDraftAsApplication(propertyId);
      
      // Clear progress after successful submission
      setHasProgress(false);
      setCurrentStep(1);
      setCompletedSteps([]);
      setLastSavedAt(null);

      toast({
        title: "Application Submitted!",
        description: "Your rental application has been submitted successfully.",
      });
    } catch (error: any) {
      console.error('Failed to submit draft:', error);
      throw error; // Re-throw to let the calling component handle it
    }
  }, [propertyId, toast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isSaving,
    hasProgress,
    currentStep,
    completedSteps,
    lastSavedAt,
    saveProgress: debouncedSave as (step: number, completedSteps: number[], data: any) => Promise<void>,
    loadProgress,
    deleteProgress,
    submitDraft
  };
};
