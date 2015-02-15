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
    $scope.timeSig = 4;
    $scope.measureCount = 9;

    // Get the available samples and add it to the scope
    $.ajax({
        type: 'GET',
        url: lightning.__httpAddr + "/samples",
        error: function() {
            f(new Error("error getting samples list"), null);
        },
        success: function(samples) {
            $scope.$apply(function() {
                $scope.samples = JSON.parse(samples);
            });
        }
    });


    $(function() {
         var lightning = Lightning.getInstance();
         $(document).keyup(function(e) {
             if (e.keyCode == 27) { // Esc key
                 lightning.hideMouseSample();
                 lightning.releaseEraser();
                 lightning.updateUI('stop');
             }
         });
    });

});
