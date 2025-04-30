updateSelectedTags({ checked = [], unchecked = [] }) {
  console.log('Updating selected tags:', { checked, unchecked });
  
  // Add newly checked tags
  if (checked.length > 0) {
    this.selectedTagIds = [...new Set([...this.selectedTagIds, ...checked])];
    console.log('Added tags:', checked);
  }
  
  // Remove newly unchecked tags
  if (unchecked.length > 0) {
    this.selectedTagIds = this.selectedTagIds.filter(id => !unchecked.includes(id));
    console.log('Removed tags:', unchecked);
  }
  
  console.log('Updated selectedTagIds:', this.selectedTagIds);
}, 