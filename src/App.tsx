import React, { useState, useRef, useEffect } from 'react';
import {
  DEFAULT_FLUX_PARAMS,
  INITIAL_TAKES,
  calculateCost,
  calculateBatchUpscaleCost,
  generateRandomSeed,
  prepareExtendVideoState,
  simulateFalVideoUpscale,
} from './utils/fluxVideoUtils';
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  createNewProject,
  duplicateProject,
  LAST_ACTIVE_PROJECT_KEY,
} from './utils/projectUtils';
import {
  AspectRatio,
  DurationSeconds,
  FluxGenerationParams,
  GenerationQueueStatus,
  UpscaleState,
  BatchUpscaleState,
  VideoTake,
  FluxProject,
} from './types/flux';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { StagePreview } from './components/StagePreview';
import { GenerationProgress } from './components/GenerationProgress';
import { ActionBar } from './components/ActionBar';
import { UpscaleBanner } from './components/UpscaleBanner';
import { GenerationsGallery } from './components/GenerationsGallery';
import { ProjectSessionModal, SessionModalView } from './components/ProjectSessionModal';
import { CheckCircle2, AlertCircle, History, Sparkles, Layers, Grid } from 'lucide-react';

export default function App() {
  // Saved Projects in Save Folder
  const [projects, setProjects] = useState<FluxProject[]>(() => loadProjectsFromStorage());
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedLastId = localStorage.getItem(LAST_ACTIVE_PROJECT_KEY);
      if (savedLastId) return savedLastId;
    }
    return 'proj-001';
  });

  // App Startup Greeting & Saved Sessions Modal
  // Greets user on app startup with option to create new session or open a saved session
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(true);
  const [sessionModalView, setSessionModalView] = useState<SessionModalView>('welcome');

  // Active Project Reference
  const initialActiveProject =
    projects.find((p) => p.id === currentProjectId) || projects[0];

  const [params, setParams] = useState<FluxGenerationParams>(
    initialActiveProject?.params || DEFAULT_FLUX_PARAMS
  );
  const [takes, setTakes] = useState<VideoTake[]>(
    initialActiveProject?.takes || INITIAL_TAKES
  );
  const [currentTake, setCurrentTake] = useState<VideoTake | null>(() => {
    if (initialActiveProject && initialActiveProject.takes.length > 0) {
      return (
        initialActiveProject.takes.find((t) => t.id === initialActiveProject.currentTakeId) ||
        initialActiveProject.takes[0]
      );
    }
    return INITIAL_TAKES[0];
  });

  const [userCredits, setUserCredits] = useState<number>(10625); // ~$42.50
  const [currentView, setCurrentView] = useState<'studio' | 'gallery'>('studio');
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const [upscaleState, setUpscaleState] = useState<UpscaleState>({
    isUpscaling: false,
    takeId: null,
    targetResolution: '1080p',
    progressPercent: 0,
    stepMessage: '',
  });

  const [batchUpscaleState, setBatchUpscaleState] = useState<BatchUpscaleState>({
    isProcessing: false,
    currentIndex: 0,
    totalCount: 0,
    targetResolution: '1080p',
    activeTakeId: null,
    completedCount: 0,
  });

  const [queueStatus, setQueueStatus] = useState<GenerationQueueStatus>({
    isGenerating: false,
    progressPercent: 0,
    currentStep: 0,
    totalSteps: DEFAULT_FLUX_PARAMS.inferenceSteps,
    phase: 'idle',
    statusMessage: 'Ready',
    etaSeconds: 0,
  });

  const generationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear toast after timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
  };

  const activeProject =
    projects.find((p) => p.id === currentProjectId) || projects[0];

  // Auto-Save Effect: Automatically saves the project and all its generations to the save folder
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setProjects((prevProjects) => {
      const updated = prevProjects.map((p) => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            params,
            takes,
            currentTakeId: currentTake?.id || null,
            thumbnailUrl:
              takes.length > 0 ? takes[0].posterUrl : p.params.startFrameUrl || undefined,
            updatedAt: Date.now(),
          };
        }
        return p;
      });
      saveProjectsToStorage(updated);
      return updated;
    });
  }, [params, takes, currentTake, currentProjectId]);

  // Project Management Actions
  const handleOpenProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    setCurrentProjectId(target.id);
    setParams(target.params);
    setTakes(target.takes);
    const foundTake =
      target.takes.find((t) => t.id === target.currentTakeId) || target.takes[0] || null;
    setCurrentTake(foundTake);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ACTIVE_PROJECT_KEY, target.id);
    }
    showToast(`Loaded project session "${target.title}"`, 'success');
  };

  const handleCreateProject = (
    title: string,
    template?: Partial<FluxGenerationParams>,
    folder?: string
  ) => {
    const newProj = createNewProject(title, template, folder);
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjectsToStorage(updated);

    setCurrentProjectId(newProj.id);
    setParams(newProj.params);
    setTakes(newProj.takes);
    setCurrentTake(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ACTIVE_PROJECT_KEY, newProj.id);
    }
    setCurrentView('studio');
    showToast(`Created new project session "${newProj.title}"`, 'success');
  };

  const handleDuplicateProject = (project: FluxProject) => {
    const copy = duplicateProject(project);
    const updated = [copy, ...projects];
    setProjects(updated);
    saveProjectsToStorage(updated);
    showToast(`Duplicated "${project.title}" to save folder`, 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      showToast('Cannot delete the only remaining project session', 'error');
      return;
    }
    const updated = projects.filter((p) => p.id !== projectId);
    setProjects(updated);
    saveProjectsToStorage(updated);

    if (currentProjectId === projectId) {
      handleOpenProject(updated[0].id);
    }
    showToast('Project removed from save folder', 'info');
  };

  const handleRenameProject = (projectId: string, newTitle: string) => {
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, title: newTitle, updatedAt: Date.now() } : p
    );
    setProjects(updated);
    saveProjectsToStorage(updated);
    showToast(`Project renamed to "${newTitle}"`, 'success');
  };

  const handleUpdateParams = (newParams: Partial<FluxGenerationParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleLoadPreset = (preset: {
    prompt: string;
    aspectRatio: AspectRatio;
    duration: DurationSeconds;
    title: string;
  }) => {
    setParams((prev) => ({
      ...prev,
      prompt: preset.prompt,
      aspectRatio: preset.aspectRatio,
      duration: preset.duration,
    }));
    showToast(`Loaded "${preset.title}" preset`, 'info');
  };

  // Cost calculation
  const currentCost = calculateCost(
    params.duration,
    params.qualityTier,
    params.nativeAudio,
    params.inferenceSteps
  );

  // Generate Video Flow
  const handleGenerate = () => {
    if (queueStatus.isGenerating) return;

    if (!params.prompt.trim()) {
      showToast('Please enter a scene prompt before generating', 'error');
      return;
    }

    if (userCredits < currentCost.credits) {
      showToast('Insufficient compute credits for this tier', 'error');
      return;
    }

    // Initialize Generation Simulation
    const totalSteps = params.inferenceSteps;
    const estTimeSec = Math.max(4, Math.round(params.duration * 0.8 + (params.inferenceSteps / 15)));

    setQueueStatus({
      isGenerating: true,
      progressPercent: 0,
      currentStep: 0,
      totalSteps,
      phase: 'queued',
      statusMessage: 'Queueing generation task on FLUX cluster...',
      etaSeconds: estTimeSec,
    });

    let currentProgress = 0;
    const startTime = Date.now();
    const totalDurationMs = 3800; // Simulated smooth render pass
    const intervalMs = 150;

    generationTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      currentProgress = Math.min(100, (elapsed / totalDurationMs) * 100);

      const step = Math.min(totalSteps, Math.floor((currentProgress / 100) * totalSteps));
      const remainingSec = Math.max(0, Math.ceil((1 - currentProgress / 100) * estTimeSec));

      let phase: GenerationQueueStatus['phase'] = 'denoising';
      let message = `Denoising latent video tensor • Step ${step}/${totalSteps}`;

      if (currentProgress < 15) {
        phase = 'queued';
        message = 'Allocating H100 GPU worker (24GB VRAM)...';
      } else if (currentProgress < 30) {
        phase = 'vram_allocation';
        message = 'Loading FLUX.1 DiT weights & spatio-temporal latents...';
      } else if (currentProgress < 75) {
        phase = 'denoising';
        message = `Synthesizing motion vectors • Step ${step}/${totalSteps}`;
      } else if (params.nativeAudio && currentProgress < 90) {
        phase = 'audio_synthesis';
        message = 'Synthesizing native synchronized audio track...';
      } else {
        phase = 'encoding';
        message = 'Encoding high-bitrate MP4 container...';
      }

      setQueueStatus({
        isGenerating: true,
        progressPercent: currentProgress,
        currentStep: step,
        totalSteps,
        phase,
        statusMessage: message,
        etaSeconds: remainingSec,
      });

      if (currentProgress >= 100) {
        if (generationTimerRef.current) clearInterval(generationTimerRef.current);

        // Pick suitable video sample based on aspect ratio & duration
        const sampleVideoUrls = [
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        ];
        const chosenUrl = sampleVideoUrls[takes.length % sampleVideoUrls.length];
        const posterUrl =
          params.startFrameUrl ||
          (params.keyframes.length > 0 ? params.keyframes[0].imageUrl : INITIAL_TAKES[0].posterUrl);

        const resolution = params.qualityTier === 'draft' ? '480p' : '1080p';
        const newTake: VideoTake = {
          id: `take-${Date.now()}`,
          createdAt: Date.now(),
          title: `Take ${takes.length + 1} • ${resolution} (${params.workflowMode.replace(/_/g, ' ').toUpperCase()})`,
          videoUrl: chosenUrl,
          posterUrl,
          duration: params.duration,
          aspectRatio: params.aspectRatio,
          qualityTier: params.qualityTier,
          resolution,
          prompt: params.prompt,
          params: { ...params },
          hasAudio: params.nativeAudio,
          costEstimate: currentCost.dollars,
        };

        setTakes((prev) => [newTake, ...prev]);
        setCurrentTake(newTake);
        setUserCredits((prev) => Math.max(0, prev - currentCost.credits));

        setQueueStatus({
          isGenerating: false,
          progressPercent: 100,
          currentStep: totalSteps,
          totalSteps,
          phase: 'completed',
          statusMessage: 'Completed',
          etaSeconds: 0,
        });

        showToast(`Video synthesized successfully! Deducted ${currentCost.credits} credits.`, 'success');
      }
    }, intervalMs);
  };

  // Upscale Workflow (fal-ai/video-upscaler or Topaz)
  const handleUpscale = async (targetResolution: '1080p' | '4K') => {
    if (!currentTake || upscaleState.isUpscaling) return;

    setUpscaleState({
      isUpscaling: true,
      takeId: currentTake.id,
      targetResolution,
      progressPercent: 12,
      stepMessage: 'Submitting draft (480p) to fal-ai/video-upscaler...',
    });

    try {
      const upscaledTake = await simulateFalVideoUpscale(
        currentTake,
        targetResolution,
        (percent, stepMessage) => {
          setUpscaleState((prev) => ({
            ...prev,
            progressPercent: percent,
            stepMessage,
          }));
        }
      );

      // Swap video player source to the newly upscaled video URL
      // Retain original draft video in session history
      setTakes((prev) => [upscaledTake, ...prev]);
      setCurrentTake(upscaledTake);
      showToast(`Upscaled to ${targetResolution} HD via fal-ai/video-upscaler!`, 'success');
    } catch (err) {
      showToast('Upscaling failed. Please try again.', 'error');
    } finally {
      setUpscaleState({
        isUpscaling: false,
        takeId: null,
        targetResolution: '1080p',
        progressPercent: 0,
        stepMessage: '',
      });
    }
  };

  const handleCompareWithDraft = (draftId: string) => {
    const draft = takes.find((t) => t.id === draftId);
    if (draft) {
      setCurrentTake(draft);
      showToast('Switched to original 480p draft for comparison', 'info');
    }
  };

  // Find original draft if currentTake is upscaled
  const originalDraftTake = currentTake?.upscaledFromId
    ? takes.find((t) => t.id === currentTake.upscaledFromId) || null
    : null;

  // Extend Video
  const handleExtend = () => {
    if (!currentTake) return;
    const extendState = prepareExtendVideoState(currentTake);
    setParams((prev) => ({
      ...prev,
      workflowMode: extendState.workflowMode,
      startFrameUrl: extendState.startFrameUrl,
      sourceVideoUrl: extendState.sourceVideoUrl,
      sourceVideoName: extendState.sourceVideoName,
      prompt: extendState.prompt,
    }));
    showToast('Loaded final keyframe into Start slot for continuous extension', 'info');
  };

  // Variations Flow
  const handleVariations = () => {
    const newSeed = generateRandomSeed();
    handleUpdateParams({ seed: newSeed });
    showToast(`New variation seed generated: #${newSeed}`, 'info');
    setTimeout(() => {
      handleGenerate();
    }, 200);
  };

  // Direct Download MP4
  const handleDownload = () => {
    if (!currentTake) return;
    const link = document.createElement('a');
    link.href = currentTake.videoUrl;
    link.download = `FLUX_Take_${currentTake.id}_${currentTake.aspectRatio.replace(':', 'x')}.mp4`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${currentTake.title} (.mp4)`, 'success');
  };

  // Cancel generation
  const handleCancel = () => {
    if (generationTimerRef.current) {
      clearInterval(generationTimerRef.current);
    }
    setQueueStatus({
      isGenerating: false,
      progressPercent: 0,
      currentStep: 0,
      totalSteps: params.inferenceSteps,
      phase: 'idle',
      statusMessage: 'Generation cancelled',
      etaSeconds: 0,
    });
    showToast('Generation cancelled', 'info');
  };

  // Toggle Favorite
  const handleToggleFavorite = (takeId: string) => {
    let nowFavorite = false;
    setTakes((prev) =>
      prev.map((take) => {
        if (take.id === takeId) {
          nowFavorite = !take.isFavorite;
          return { ...take, isFavorite: nowFavorite };
        }
        return take;
      })
    );
    if (currentTake?.id === takeId) {
      setCurrentTake((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    showToast(
      nowFavorite ? 'Marked take as favorite (★)' : 'Removed take from favorites',
      'info'
    );
  };

  // Batch Upscale Queue Workflow (fal-ai/video-upscaler)
  const handleBatchUpscale = async (
    takeIds: string[],
    targetResolution: '1080p' | '4K'
  ) => {
    if (takeIds.length === 0 || batchUpscaleState.isProcessing) return;

    const batchCost = calculateBatchUpscaleCost(takeIds.length, targetResolution);
    if (userCredits < batchCost.credits) {
      showToast(
        `Insufficient compute credits for batch upscale (${batchCost.credits} credits required)`,
        'error'
      );
      return;
    }

    setBatchUpscaleState({
      isProcessing: true,
      currentIndex: 1,
      totalCount: takeIds.length,
      targetResolution,
      activeTakeId: takeIds[0],
      completedCount: 0,
    });

    showToast(
      `Starting batch upscale of ${takeIds.length} videos to ${targetResolution}...`,
      'info'
    );

    let completed = 0;
    for (let i = 0; i < takeIds.length; i++) {
      const targetId = takeIds[i];
      setBatchUpscaleState((prev) => ({
        ...prev,
        currentIndex: i + 1,
        activeTakeId: targetId,
      }));

      // Find current draft take
      const targetTake = takes.find((t) => t.id === targetId);
      if (targetTake) {
        try {
          const upscaled = await simulateFalVideoUpscale(targetTake, targetResolution);
          completed += 1;

          // Replace take in place: update resolution, badge, URL, and upscale details
          setTakes((prev) =>
            prev.map((t) =>
              t.id === targetId
                ? {
                    ...t,
                    title: `${t.title.replace(/\[.*\]/, '').trim()} [${targetResolution}]`,
                    resolution: targetResolution,
                    qualityTier: 'final',
                    videoUrl: upscaled.videoUrl,
                    costEstimate: upscaled.costEstimate,
                    upscaleDetails: upscaled.upscaleDetails,
                  }
                : t
            )
          );

          if (currentTake?.id === targetId) {
            setCurrentTake((prev) =>
              prev
                ? {
                    ...prev,
                    title: `${prev.title.replace(/\[.*\]/, '').trim()} [${targetResolution}]`,
                    resolution: targetResolution,
                    qualityTier: 'final',
                    videoUrl: upscaled.videoUrl,
                    costEstimate: upscaled.costEstimate,
                    upscaleDetails: upscaled.upscaleDetails,
                  }
                : null
            );
          }

          setBatchUpscaleState((prev) => ({
            ...prev,
            completedCount: completed,
          }));
        } catch (err) {
          console.error(`Failed to upscale ${targetId}`, err);
        }
      }
    }

    setUserCredits((prev) => Math.max(0, prev - batchCost.credits));

    setBatchUpscaleState({
      isProcessing: false,
      currentIndex: 0,
      totalCount: 0,
      targetResolution: '1080p',
      activeTakeId: null,
      completedCount: completed,
    });

    showToast(
      `Batch upscale complete! ${completed} of ${takeIds.length} videos converted to ${targetResolution} HD.`,
      'success'
    );
  };

  // Delete take
  const handleDeleteTake = (takeId: string) => {
    setTakes((prev) => prev.filter((t) => t.id !== takeId));
    if (currentTake?.id === takeId) {
      setCurrentTake(takes.find((t) => t.id !== takeId) || null);
    }
    showToast('Take deleted', 'info');
  };

  const [mobileTab, setMobileTab] = useState<'controls' | 'stage'>('controls');

  return (
    <div className="h-screen bg-[#09090b] text-neutral-100 flex flex-col select-none antialiased overflow-hidden">
      {/* Studio Header with View Switcher & Session Manager */}
      <Header
        onLoadPreset={handleLoadPreset}
        userCredits={userCredits}
        currentView={currentView}
        onChangeView={setCurrentView}
        takesCount={takes.length}
        favoritesCount={takes.filter((t) => t.isFavorite).length}
        activeProject={activeProject}
        allProjects={projects}
        onOpenSessionManager={(v) => {
          setSessionModalView(v);
          setIsSessionModalOpen(true);
        }}
        onSwitchProject={handleOpenProject}
        isAutoSaved={true}
      />

      {/* Main Content Area: Studio View vs Dedicated Gallery View */}
      {currentView === 'gallery' ? (
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <GenerationsGallery
            takes={takes}
            selectedTakeId={currentTake?.id || null}
            batchUpscaleState={batchUpscaleState}
            onSelectTake={(take) => {
              setCurrentTake(take);
              setCurrentView('studio');
              showToast(`Loaded "${take.title}" in Studio player`, 'info');
            }}
            onToggleFavorite={handleToggleFavorite}
            onBatchUpscale={handleBatchUpscale}
            onDeleteTake={handleDeleteTake}
            compact={false}
          />
        </main>
      ) : (
        <>
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex border-b border-white/[0.08] bg-neutral-900/90 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMobileTab('controls')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                mobileTab === 'controls'
                  ? 'text-white border-white bg-white/5 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-white'
              }`}
            >
              Controls
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('stage')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                mobileTab === 'stage'
                  ? 'text-white border-white bg-white/5 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-white'
              }`}
            >
              Preview Stage
            </button>
          </div>

          {/* Two-Column Studio Layout */}
          <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Column 1: Controls (Left Panel) */}
            <section
              aria-label="Creative Controls"
              className={`w-full lg:w-[460px] xl:w-[480px] shrink-0 h-full min-h-0 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-neutral-950 flex flex-col overflow-hidden ${
                mobileTab === 'controls' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <ControlsPanel
                params={params}
                onChangeParams={handleUpdateParams}
                disabled={queueStatus.isGenerating}
              />
            </section>

            {/* Column 2: Stage & Export (Right Panel) */}
            <section
              aria-label="Preview & Stage"
              className={`flex-1 h-full min-h-0 flex flex-col p-4 sm:p-5 overflow-y-auto space-y-4 bg-neutral-950 ${
                mobileTab === 'stage' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* Real-time Generation Progress Bar */}
              <GenerationProgress status={queueStatus} onCancel={handleCancel} />

              {/* Live Video Player Stage */}
              <StagePreview
                currentTake={currentTake}
                aspectRatio={params.aspectRatio}
                fps={params.fps}
                isGenerating={queueStatus.isGenerating}
              />

              {/* Video Output & Upscale Bar */}
              <UpscaleBanner
                currentTake={currentTake}
                upscaleState={upscaleState}
                onUpscale={handleUpscale}
                onCompareWithDraft={handleCompareWithDraft}
                originalDraftTake={originalDraftTake}
              />

              {/* Action Bar */}
              <ActionBar
                onGenerate={handleGenerate}
                onExtend={handleExtend}
                onDownload={handleDownload}
                costEstimate={currentCost}
                isGenerating={queueStatus.isGenerating || upscaleState.isUpscaling}
                canExtend={Boolean(currentTake)}
                canDownload={Boolean(currentTake)}
              />

              {/* Docked Generations Gallery Section */}
              <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-neutral-900/60 shadow-lg">
                <div className="px-4 py-3 bg-neutral-900/80 border-b border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      Generations History ({takes.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('gallery')}
                    className="text-[11px] font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Full Screen Gallery</span>
                    <Grid className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-[440px] overflow-y-auto">
                  <GenerationsGallery
                    takes={takes}
                    selectedTakeId={currentTake?.id || null}
                    batchUpscaleState={batchUpscaleState}
                    onSelectTake={setCurrentTake}
                    onToggleFavorite={handleToggleFavorite}
                    onBatchUpscale={handleBatchUpscale}
                    onDeleteTake={handleDeleteTake}
                    compact={true}
                  />
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-400" />
          )}
          <span className="text-zinc-100">{toastMessage.text}</span>
        </div>
      )}

      {/* App Startup Greeting & Saved Sessions Library Modal */}
      <ProjectSessionModal
        isOpen={isSessionModalOpen}
        initialView={sessionModalView}
        projects={projects}
        currentProjectId={currentProjectId}
        onClose={() => setIsSessionModalOpen(false)}
        onOpenProject={(id) => {
          handleOpenProject(id);
          setIsSessionModalOpen(false);
        }}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProject}
      />
    </div>
  );
}
