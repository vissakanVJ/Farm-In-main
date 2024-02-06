document.addEventListener('DOMContentLoaded', () => {
  const cropTitle = document.getElementById('crop-title');
  const timeline = document.getElementById('timeline');
  const urlParams = new URLSearchParams(window.location.search);
  const cropName = urlParams.get('crop');

  if (cropName) {
    document.title = `${cropName} Timeline`;
    cropTitle.textContent = cropName + " Crop Timeline";

    fetch('cropPhases.json')
      .then(response => response.json())
      .then(data => {
        const cropPhases = data[cropName];

        if (cropPhases && cropPhases.length > 0) {
          cropPhases.forEach(phase => {
            const phaseItem = document.createElement('li');
            phaseItem.classList.add('timeline-item');

            const phaseContent = document.createElement('div');
            phaseContent.classList.add('timeline-content');

            const phaseName = document.createElement('h2');
            phaseName.classList.add('phase-name');
            phaseName.textContent = phase.name;

            const phaseDescription = document.createElement('p');
            phaseDescription.classList.add('phase-description');
            phaseDescription.textContent = phase.description;

            const phaseDuration = document.createElement('p');
            phaseDuration.classList.add('phase-duration');
            phaseDuration.textContent = `Duration: ${phase.duration}`;

            phaseContent.appendChild(phaseName);
            phaseContent.appendChild(phaseDescription);
            phaseContent.appendChild(phaseDuration);
            phaseItem.appendChild(phaseContent);
            timeline.appendChild(phaseItem);
          });
        } else {
          const noPhasesMessage = document.createElement('p');
          noPhasesMessage.textContent = 'No phases found for the crop.';
          timeline.appendChild(noPhasesMessage);
        }
      })
      .catch(error => {
        console.error('Error fetching crop phases:', error);
      });
  } else {
    const noCropMessage = document.createElement('p');
    noCropMessage.textContent = 'Crop name not found in the URL parameter.';
    timeline.appendChild(noCropMessage);
  }
});
