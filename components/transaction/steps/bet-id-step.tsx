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
}

import { cn } from "@/lib/utils"

export function BetIdStep({ selectedPlatform, selectedBetId, onSelect, type }: BetIdStepProps) {
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
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Choisissez votre compte</h2>
        <p className="text-sm text-muted-foreground font-medium">Sélectionnez l'ID de pari pour cette opération</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-gold dark:text-turquoise" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {betIds.map((betId) => (
            <Card
              key={betId.id}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.99] rounded-lg",
                selectedBetId?.id === betId.id
                  ? type === "deposit"
                    ? "bg-gold text-white shadow-gold-lg ring-2 ring-gold/20"
                    : "bg-turquoise text-white shadow-turquoise-lg ring-2 ring-turquoise/20"
                  : "bg-white dark:bg-[#121212] border border-border"
              )}
              onClick={() => onSelect(betId)}
            >
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl" />

              <CardContent className="p-4 h-[120px] flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Membre Premium</p>
                    <h3 className="text-lg font-black tracking-tight">{betId.user_app_id}</h3>
                  </div>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(betId)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBetId(betId)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold opacity-80">Compte Vérifié</span>
                  </div>
                  <span className="text-xs font-mono opacity-50">
                    {new Date(betId.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="h-[120px] rounded-[24px] border-2 border-dashed border-muted-foreground/20 hover:border-gold/40 dark:hover:border-turquoise/40 hover:bg-gold/5 dark:hover:bg-turquoise/5 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-gold dark:group-hover:bg-turquoise group-hover:text-white dark:group-hover:text-black transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-black text-sm text-muted-foreground group-hover:text-gold dark:group-hover:text-turquoise transition-colors">Ajouter</span>
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
