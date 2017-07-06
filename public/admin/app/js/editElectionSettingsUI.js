  $(document).ready(function() {
       $("#nominationmoreinfobutton").click(function(){
           $(this).popover("toggle");
       });
       $( "#createElectionStep1Button" ).prop( "disabled", true ).click(function() {
          $(this).prop( "disabled", true );
          $( "#createElectionStep2Button" ).prop( "disabled", false );
          $( "#createElectionStep3Button" ).prop( "disabled", false );
          $( "#createElectionInputs2" ).hide();
          $( "#createElectionInputs3" ).hide();
          $( "#createElectionInputs1" ).show();
          $( "#createElectionNextStep2Button" ).show();
          $( "#createElectionNextStep3Button" ).hide();
          $("#submitNewElectionButton").hide();
        });
        $( "#createElectionNextStep2Button").prop( "disabled", false ).click(function() {
          $(this).hide();
          $( "#createElectionNextStep3Button").removeClass("hidden").show();
          $( "#createElectionStep2Button" ).prop( "disabled", true );
          $( "#createElectionStep1Button" ).prop( "disabled", false );
          $( "#createElectionStep3Button" ).prop( "disabled", false );
          $( "#createElectionInputs1" ).hide();
          $( "#createElectionInputs3" ).hide();
          $( "#createElectionInputs2" ).removeClass("hidden").show();
          $("#submitNewElectionButton").hide();
        });
        $( "#createElectionStep2Button" ).click(function() {
          $(this).prop( "disabled", true );
          $( "#createElectionStep1Button" ).prop( "disabled", false );
          $( "#createElectionStep3Button" ).prop( "disabled", false );
          $( "#createElectionInputs1" ).hide();
          $( "#createElectionInputs3" ).hide();
          $( "#createElectionInputs2" ).removeClass("hidden").show();
          $( "#createElectionNextStep2Button" ).hide();
          $( "#createElectionNextStep3Button" ).removeClass("hidden").show();
          $("#submitNewElectionButton").hide();
        });
        //
        $( "#createElectionNextStep3Button").prop( "disabled", false ).click(function() {
          $(this).hide();
          $( "#createElectionNextStep2Button" ).hide();
          $( "#createElectionStep2Button" ).prop( "disabled", false );
          $( "#createElectionStep1Button" ).prop( "disabled", false );
          $( "#createElectionStep3Button" ).prop( "disabled", true );
          $( "#createElectionInputs1" ).hide();
          $( "#createElectionInputs2" ).hide();
          $( "#createElectionInputs3" ).removeClass("hidden").show();
          $("#submitNewElectionButton").removeClass("hidden").show();
        });
        $( "#createElectionStep3Button" ).click(function() {
          $(this).prop( "disabled", true );
          $( "#createElectionStep1Button" ).prop( "disabled", false );
          $( "#createElectionStep2Button" ).prop( "disabled", false );
          $( "#createElectionInputs1" ).hide();
          $( "#createElectionInputs2" ).hide();
          $( "#createElectionInputs3" ).removeClass("hidden").show();
          $( "#createElectionNextStep2Button" ).hide();
          $( "#createElectionNextStep3Button" ).hide();
          $("#submitNewElectionButton").removeClass("hidden").show();
        });
        $( "#updateElectionStep1Button" ).prop( "disabled", true ).click(function() {
          $(this).prop( "disabled", true );
          $( "#updateElectionStep2Button" ).prop( "disabled", false );
          $( "#updateElectionStep3Button" ).prop( "disabled", false );
          $( "#updateElectionInputs2" ).hide();
          $( "#updateElectionInputs3" ).hide();
          $( "#updateElectionInputs1" ).show();
          $( "#updateElectionNextStep2Button" ).show();
          $( "#updateElectionNextStep3Button" ).hide();
          $("#submitUpdatedElectionButton").hide();
        });
        $( "#updateElectionNextStep2Button" ).prop( "disabled", false ).click(function() {
          $(this).hide();
          $( "#updateElectionNextStep3Button" ).removeClass("hidden").show();
          $( "#updateElectionStep2Button" ).prop( "disabled", true );
          $( "#updateElectionStep1Button" ).prop( "disabled", false );
          $( "#updateElectionStep3Button" ).prop( "disabled", false );
          $( "#updateElectionInputs1" ).hide();
          $( "#updateElectionInputs3" ).hide();
          $( "#updateElectionInputs2" ).removeClass("hidden").show();
          $("#submitUpdatedElectionButton").hide();
        });
        $( "#updateElectionStep2Button" ).click(function() {
          $(this).prop( "disabled", true );
          $( "#updateElectionStep1Button" ).prop( "disabled", false );
          $( "#updateElectionStep3Button" ).prop( "disabled", false );
          $( "#updateElectionInputs1" ).hide();
          $( "#updateElectionInputs3" ).hide();
          $( "#updateElectionInputs2" ).removeClass("hidden").show();
          $( "#updateElectionNextStep2Button" ).hide();
          $( "#updateElectionNextStep3Button" ).removeClass("hidden").show();
          $("#submitUpdatedElectionButton").hide();
        });
        //
        $( "#updateElectionNextStep3Button" ).prop( "disabled", false ).click(function() {
          $(this).hide();
          $( "#updateElectionNextStep2Button" ).hide();
          $( "#updateElectionStep2Button" ).prop( "disabled", false );
          $( "#updateElectionStep1Button" ).prop( "disabled", false );
          $( "#updateElectionStep3Button" ).prop( "disabled", true );
          $( "#updateElectionInputs1" ).hide();
          $( "#updateElectionInputs2" ).hide();
          $( "#updateElectionInputs3" ).removeClass("hidden").show();
          $("#submitUpdatedElectionButton").removeClass("hidden").show();
        });
        $( "#updateElectionStep3Button" ).click(function() {
          $(this).prop( "disabled", true );
          $( "#updateElectionStep1Button" ).prop( "disabled", false );
          $( "#updateElectionStep2Button" ).prop( "disabled", false );
          $( "#updateElectionInputs1" ).hide();
          $( "#updateElectionInputs2" ).hide();
          $( "#updateElectionInputs3" ).removeClass("hidden").show();
          $( "#updateElectionNextStep2Button" ).hide();
          $( "#updateElectionNextStep3Button" ).hide();
          $("#submitUpdatedElectionButton").removeClass("hidden").show();
        });
        $("#newofevaltyperadio").click(function(){
          $("#newvotesallowedinput").addClass("hidden");
          $("#newrangedefinitioninput").removeClass("hidden");
          $("#newbudgetdefinitioninput").addClass("hidden");
        });
        $("#newofvotetyperadio").click(function(){
          $("#newvotesallowedinput").removeClass("hidden");
          $("#newrangedefinitioninput").addClass("hidden");
          $("#newbudgetdefinitioninput").addClass("hidden");
        });
        $("#newofbudgettyperadio").click(function(){
          $("#newvotesallowedinput").addClass("hidden");
          $("#newrangedefinitioninput").addClass("hidden");
          $("#newbudgetdefinitioninput").removeClass("hidden");
          $('input[name="newElectionVotesAllowed"]').val(null);
        });
        $("#updatedofevaltyperadio").click(function(){
          $("#updatedvotesallowedinput").addClass("hidden");
          $("#updatedrangedefinitioninput").removeClass("hidden");
          $("#updatedbudgetdefinitioninput").addClass("hidden");
        });
        $("#updatedofvotetyperadio").click(function(){
          $("#updatedvotesallowedinput").removeClass("hidden");
          $("#updatedrangedefinitioninput").addClass("hidden");
          $("#updatedbudgetdefinitioninput").addClass("hidden");
        });
         $("#updatedofbudgettyperadio").click(function(){
          $("#updatedvotesallowedinput").addClass("hidden");
          $("#updatedrangedefinitioninput").addClass("hidden");
          $("#updatedbudgetdefinitioninput").removeClass("hidden");
          $('input[name="updatedElectionVotesAllowed"]').val(null);
        });
        $("#optionsRadios1").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").hide();
            }
        });
        $("#optionsRadios2").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").hide();
            }
        });
        $("#optionsRadios3").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").hide();
            }
        });
        $("#optionsRadios4").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").removeClass("hidden").show();
            }
        });
        $("#updateOptionsRadios1").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").hide();
            }
        });
        $("#updateOptionsRadios2").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").hide();
            }
        });
        $("#updateOptionsRadios3").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").hide();
            }
        });
        $("#updateOptionsRadios4").change(
        function(){
            if (this.checked) {
                $("#nominationsalloweddiv").removeClass("hidden").show();
            }
        });
        $("#switchnomineelimitedinput").change(
          function(){
            if (this.checked) {
              $("#switchnomineelimitedlabel").html("Yes");
            } else {
              $("#switchnomineelimitedlabel").html("No");
            }
        });
        $("#switchcommentsonelectionallowedinput").change(
          function(){
            if (this.checked) {
              $("#switchcommentsonelectionallowedlabel").html("Yes");
            } else {
              $("#switchcommentsonelectionallowedlabel").html("No");
            }
        });
      var deleteButton = $('input[name="deleteElection"]');
      $(deleteButton).click(function() {
           if (!confirm("Do you want to delete?")){
              return false;
            }
      });
  });