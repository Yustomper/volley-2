// volleyball-app/src/modules/team/hooks/useModal.js

import { useState } from 'react';

export const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const openConfirmModal = (type, id, teamId) => {
    setConfirmModal({ isOpen: true, type, id, teamId });
  };

  const closeConfirmModal = () => setConfirmModal({ isOpen: false, type: '', id: null });

  return {
    isModalOpen,
    editingTeam,
    confirmModal,
    openModal,
    closeModal,
    openConfirmModal,
    closeConfirmModal,
    setEditingTeam,
  };
};
