lightningApp.controller('mainController', function($scope, $http, $location, $rootScope) {
    $scope.template = {
        sampleNav: 'views/samples.html'
    }
    $scope.availableSamples = [
        'bass',
        'meow',
        'cow',
        'guitar',
        'gong',
        'quack',
        'tomtom',
        'triangle',
        'bark',
        'pig',
        'sheep',
        'piano',
        'crow',
        'blip',
        'mouth_harp',
        'squeaky-dog-toy'
    ];

    // Setup the samples array that will be used for playback
    $scope.sampleArr = [];
    // Setup the default time signature
    $scope.timeSig = 3;


    $(function() {
         var lightning = Lightning.getInstance();
         $(document).keyup(function(e) {
             if (e.keyCode == 27) { // Esc key
                 lightning.hideMouseSample();
                 lightning.releaseEraser();
                 lightning.updateUI('stop');
             }
         });

         console.log('setting up sample triggers');
         // wire up sample icons to their backend calls
         lightning.setupSampleTriggers($('#sample-triggers > ul li'));
    });

});
