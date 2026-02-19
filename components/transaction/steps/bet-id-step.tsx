"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { userAppIdApi } from "@/lib/api-client"
import type { UserAppId, Platform } from "@/lib/types"
import { toast } from "react-hot-toast"

interface BetIdStepProps {
  selectedPlatform: Platform | null
  selectedBetId: UserAppId | null
  onSelect: (betId: UserAppId) => void
  onNext: () => void
  type: "deposit" | "withdrawal"
  /** Affichage en liste verticale (au lieu de grille) */
  listLayout?: boolean
}

import { cn } from "@/lib/utils"

export function BetIdStep({ selectedPlatform, selectedBetId, onSelect, type, listLayout }: BetIdStepProps) {
  const [betIds, setBetIds] = useState<UserAppId[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBetId, setEditingBetId] = useState<UserAppId | null>(null)
  const [newBetId, setNewBetId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ... (keeping search functionality states)
  const [isSearching, setIsSearching] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [pendingBetId, setPendingBetId] = useState<{ appId: string; betId: string; userName: string } | null>(null)

  // ... (keeping edit search functionality states)
  const [isEditSearching, setIsEditSearching] = useState(false)
  const [isEditConfirmationModalOpen, setIsEditConfirmationModalOpen] = useState(false)
  const [isEditErrorModalOpen, setIsEditErrorModalOpen] = useState(false)
  const [editErrorMessage, setEditErrorMessage] = useState("")
  const [pendingEditBetId, setPendingEditBetId] = useState<{ id: number; appId: string; betId: string; userName: string } | null>(null)

  useEffect(() => {
    if (selectedPlatform) {
      fetchBetIds()
    }
  }, [selectedPlatform])

  const fetchBetIds = async () => {
    if (!selectedPlatform) return

    setIsLoading(true)
    try {
      const data = await userAppIdApi.getByPlatform(selectedPlatform.id)
      setBetIds(data)
    } catch (error) {
      toast.error("Erreur lors du chargement des IDs de pari")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBetId = async () => {
    if (!selectedPlatform || !newBetId) return
    setIsSearching(true)
    try {
      const response = await userAppIdApi.searchUser(selectedPlatform.id, newBetId)
      if (response && response.Name) {
        setPendingBetId({
          appId: selectedPlatform.id,
          betId: newBetId,
          userName: response.Name
        })
        setIsConfirmationModalOpen(true)
        setIsAddDialogOpen(false)
      } else {
        setErrorMessage("Utilisateur non trouvé")
        setIsErrorModalOpen(true)
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de la recherche")
      setIsErrorModalOpen(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleConfirmAddBetId = async () => {
    if (!pendingBetId) return
    setIsSubmitting(true)
    try {
      await userAppIdApi.create(pendingBetId.betId, pendingBetId.appId)
      toast.success("ID de pari ajouté avec succès")
      setIsConfirmationModalOpen(false)
      setPendingBetId(null)
      setNewBetId("")
      fetchBetIds()
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'ID")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearchEditBetId = async () => {
    if (!selectedPlatform || !newBetId || !editingBetId) return
    setIsEditSearching(true)
    try {
      const response = await userAppIdApi.searchUser(selectedPlatform.id, newBetId)
      if (response && response.Name) {
        setPendingEditBetId({
          id: editingBetId.id,
          appId: selectedPlatform.id,
          betId: newBetId,
          userName: response.Name
        })
        setIsEditConfirmationModalOpen(true)
        setIsEditDialogOpen(false)
      } else {
        setEditErrorMessage("Utilisateur non trouvé")
        setIsEditErrorModalOpen(true)
      }
    } catch (error: any) {
      setEditErrorMessage(error.response?.data?.message || "Erreur lors de la recherche")
      setIsEditErrorModalOpen(true)
    } finally {
      setIsEditSearching(false)
    }
  }

  const handleConfirmEditBetId = async () => {
    if (!pendingEditBetId) return
    setIsSubmitting(true)
    try {
      await userAppIdApi.update(
        pendingEditBetId.id,
        pendingEditBetId.betId,
        pendingEditBetId.appId
      )
      toast.success("ID de pari modifié avec succès")
      setIsEditConfirmationModalOpen(false)
      setPendingEditBetId(null)
      setNewBetId("")
      fetchBetIds()
    } catch (error) {
      toast.error("Erreur lors de la modification")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBetId = async (betId: UserAppId) => {
    if (!confirm("Voulez-vous vraiment supprimer cet ID ?")) return
    try {
      await userAppIdApi.delete(betId.id)
      toast.success("ID de pari supprimé avec succès")
      fetchBetIds()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const openEditDialog = (betId: UserAppId) => {
    setEditingBetId(betId)
    setNewBetId(betId.user_app_id)
    setIsEditDialogOpen(true)
  }

  if (!selectedPlatform) {
    return (
      <Card className="border-none bg-muted/5">
        <CardContent className="flex items-center justify-center py-20 text-muted-foreground font-bold">
          Veuillez d'abord sélectionner une plateforme
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn(listLayout ? "space-y-2" : "space-y-4 sm:space-y-6")}>
      <div className={cn("text-center space-y-0.5 mb-3", listLayout && "mb-2")}>
        <h2 className={cn("font-bold text-foreground", listLayout ? "text-base sm:text-lg" : "text-base sm:text-xl")}>Choisissez votre compte</h2>
        {!listLayout && <p className="text-xs sm:text-sm text-muted-foreground">ID de pari pour cette opération</p>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gold dark:text-turquoise" />
        </div>
      ) : (
        <div className={cn(listLayout ? "flex flex-col gap-2.5" : "grid grid-cols-2 gap-2 sm:gap-4")}>
          {betIds.map((betId) => {
            const selected = selectedBetId?.id === betId.id
            const isDeposit = type === "deposit"
            if (listLayout) {
              return (
                <div
                  key={betId.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(betId)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(betId)}
                  className={cn(
                    "rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.99] cursor-pointer",
                    "flex items-center gap-3 py-2.5 px-3 border border-border/60",
                    selected
                      ? "bg-muted/60 dark:bg-muted/40 border-l-4 border-l-primary"
                      : "bg-card hover:bg-muted/40 dark:hover:bg-muted/30 border-l-4 border-l-transparent hover:border-border"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold bg-muted/50 dark:bg-muted/50 text-foreground",
                    selected && "ring-2 ring-primary/20"
                  )}>
                    {betId.user_app_id.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{betId.user_app_id}</p>
                    <p className="text-[10px] truncate text-muted-foreground">
                      Vérifié · {new Date(betId.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted/60" onClick={() => openEditDialog(betId)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted/60" onClick={() => handleDeleteBetId(betId)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full shrink-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Card
                key={betId.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.98] rounded-xl sm:rounded-lg",
                  selected ? (isDeposit ? "bg-gold text-white shadow-lg ring-2 ring-gold/30" : "bg-turquoise text-white shadow-lg ring-2 ring-turquoise/30") : "bg-card border-border/80 hover:border-primary/20"
                )}
                onClick={() => onSelect(betId)}
              >
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 blur-xl" />
                <CardContent className="p-2.5 sm:p-4 min-h-[88px] sm:min-h-[108px] flex flex-col justify-between relative z-10">
                  <div className="flex justify-between items-start gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider opacity-60">Membre</p>
                      <h3 className="text-sm sm:text-base font-black tracking-tight truncate">{betId.user_app_id}</h3>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); openEditDialog(betId) }}><Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleDeleteBetId(betId) }}><Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 sm:mt-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"><CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" /></div>
                      <span className="text-[10px] sm:text-xs font-bold opacity-80">Vérifié</span>
                    </div>
                    <span className="text-[9px] sm:text-xs font-mono opacity-50">{new Date(betId.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className={cn(
              "rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 py-2.5 px-3 group",
              listLayout
                ? "border-border/60 hover:border-border hover:bg-muted/40 dark:hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                : "min-h-[88px] sm:min-h-[108px] rounded-xl sm:rounded-2xl border-muted-foreground/25 hover:border-gold/50 dark:hover:border-turquoise/50 hover:bg-gold/5 dark:hover:bg-turquoise/5"
            )}
          >
            <div className={cn(
              "rounded-full flex items-center justify-center transition-colors",
              listLayout ? "w-8 h-8 bg-muted/60 group-hover:bg-muted text-foreground" : "w-8 h-8 sm:w-10 sm:h-10 bg-muted group-hover:bg-gold dark:group-hover:bg-turquoise group-hover:text-white dark:group-hover:text-black"
            )}>
              <Plus className={listLayout ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5"} />
            </div>
            <span className={cn("font-semibold text-muted-foreground transition-colors", listLayout ? "text-xs group-hover:text-foreground" : "text-xs sm:text-sm group-hover:text-gold dark:group-hover:text-turquoise")}>Ajouter</span>
          </button>
        </div>
      )}
      {/* Add Bet ID Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#121212] border-none shadow-2xl rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Ajouter un ID de pari</DialogTitle>
            <DialogDescription className="font-medium">
              Recherchez et validez votre ID de compte pour {selectedPlatform.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="betId" className="text-xs font-black uppercase tracking-widest text-muted-foreground">ID de pari</Label>
              <Input
                id="betId"
                value={newBetId}
                onChange={(e) => setNewBetId(e.target.value)}
                placeholder="Entrez votre ID de pari"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSearching && !isSubmitting) {
                    handleAddBetId()
                  }
                }}
                disabled={isSearching || isSubmitting}
                className="h-12 rounded-xl bg-muted/50 border-none text-lg font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => {
              setIsAddDialogOpen(false)
              setNewBetId("")
            }} disabled={isSearching || isSubmitting} className="font-bold">
              Annuler
            </Button>
            <Button
              onClick={handleAddBetId}
              disabled={!newBetId.trim() || isSearching || isSubmitting}
              variant="deposit"
              className="px-8 font-black uppercase tracking-widest"
            >
              {isSearching || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSearching ? "Recherche..." : "Ajout..."}
                </>
              ) : (
                "Rechercher"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <CheckCircle className="h-6 w-6 text-gold dark:text-turquoise" />
              Confirmer
            </DialogTitle>
            <DialogDescription className="font-medium">
              Voulez-vous ajouter cet ID de pari ?
            </DialogDescription>
          </DialogHeader>
          {pendingBetId && (
            <div className="bg-muted/30 rounded-2xl p-6 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-muted pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom</span>
                <span className="font-bold">{pendingBetId.userName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-muted pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">ID de pari</span>
                <span className="font-mono font-bold">{pendingBetId.betId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Plateforme</span>
                <span className="font-bold">{selectedPlatform?.name}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsConfirmationModalOpen(false)
                setPendingBetId(null)
              }}
              className="font-bold"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmAddBetId}
              disabled={isSubmitting}
              variant="deposit"
              className="px-8 font-black uppercase tracking-widest"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <XCircle className="h-6 w-6 text-red-500" />
              Erreur
            </DialogTitle>
            <DialogDescription className="font-medium text-red-500/80">
              {errorMessage || "Une erreur est survenue"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsErrorModalOpen(false)
                setErrorMessage("")
              }}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bet ID Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Modifier l'ID</DialogTitle>
            <DialogDescription className="font-medium">
              Recherchez et validez votre nouvel ID pour {selectedPlatform.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="editBetId" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nouvel ID de pari</Label>
              <Input
                id="editBetId"
                value={newBetId}
                onChange={(e) => setNewBetId(e.target.value)}
                placeholder="Entrez votre nouvel ID"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isEditSearching && !isSubmitting) {
                    handleSearchEditBetId()
                  }
                }}
                disabled={isEditSearching || isSubmitting}
                className="h-12 rounded-xl bg-muted/50 border-none text-lg font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => {
              setIsEditDialogOpen(false)
              setNewBetId("")
            }} disabled={isEditSearching || isSubmitting} className="font-bold">
              Annuler
            </Button>
            <Button
              onClick={handleSearchEditBetId}
              disabled={!newBetId.trim() || isEditSearching || isSubmitting}
              variant="deposit"
              className="px-8 font-black uppercase tracking-widest"
            >
              {isEditSearching || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditSearching ? "Recherche..." : "Modif..."}
                </>
              ) : (
                "Rechercher"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Confirmation Modal */}
      <Dialog open={isEditConfirmationModalOpen} onOpenChange={setIsEditConfirmationModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <CheckCircle className="h-6 w-6 text-turquoise" />
              Confirmer
            </DialogTitle>
            <DialogDescription className="font-medium">
              Voulez-vous modifier cet ID ?
            </DialogDescription>
          </DialogHeader>
          {pendingEditBetId && (
            <div className="bg-muted/30 rounded-2xl p-6 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-muted pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom</span>
                <span className="font-bold">{pendingEditBetId.userName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-muted pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">ID de pari</span>
                <span className="font-mono font-bold">{pendingEditBetId.betId}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditConfirmationModalOpen(false)
                setPendingEditBetId(null)
              }}
              className="font-bold"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmEditBetId}
              disabled={isSubmitting}
              variant="deposit"
              className="px-8 font-black uppercase tracking-widest"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Error Modal */}
      <Dialog open={isEditErrorModalOpen} onOpenChange={setIsEditErrorModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#2D3436] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <XCircle className="h-6 w-6 text-red-500" />
              Erreur
            </DialogTitle>
            <DialogDescription className="font-medium text-red-500/80">
              {editErrorMessage || "Une erreur est survenue"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsEditErrorModalOpen(false)
                setEditErrorMessage("")
              }}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
