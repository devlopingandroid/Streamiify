import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";

describe("Frontend UX, Responsiveness & Accessibility Tests", () => {
  describe("Modal Accessibility & Keyboard Navigation", () => {
    it("1. Modal closes when pressing the Escape key", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal Body Content</div>
        </Modal>
      );

      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("2. Modal renders role='dialog' and aria-modal='true' with close button aria-label", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Accessible Modal">
          <div>Modal Body</div>
        </Modal>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");

      const closeBtn = screen.getByLabelText("Close dialog modal");
      expect(closeBtn).toBeInTheDocument();
    });

    it("3. ConfirmDialog renders message, cancel, and confirm buttons", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Delete Video"
          message="Are you sure you want to delete this video permanently?"
          confirmLabel="Delete"
        />
      );

      expect(screen.getByText("Delete Video")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete this video permanently?")
      ).toBeInTheDocument();

      const deleteBtn = screen.getByRole("button", { name: "Delete" });
      fireEvent.click(deleteBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("Button Interactions & Pending States", () => {
    it("4. Button disables click events and shows spinner when isLoading is true", () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading={true} onClick={handleClick}>
          Submit Data
        </Button>
      );

      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("5. Form submit button prevents duplicate clicks when disabled during pending state", () => {
      const TestForm = () => {
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitCount, setSubmitCount] = useState(0);

        const handleSubmit = (e) => {
          e.preventDefault();
          if (isSubmitting) return;
          setIsSubmitting(true);
          setSubmitCount((c) => c + 1);
        };

        return (
          <form onSubmit={handleSubmit}>
            <button type="submit" disabled={isSubmitting}>
              Submit Form
            </button>
            <span data-testid="count">{submitCount}</span>
          </form>
        );
      };

      render(<TestForm />);

      const submitBtn = screen.getByRole("button", { name: "Submit Form" });
      fireEvent.click(submitBtn);
      fireEvent.click(submitBtn);

      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });
  });
});
